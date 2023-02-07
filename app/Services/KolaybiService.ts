import Config from '@ioc:Adonis/Core/Config'
import OrderType from 'App/Enums/OrderType'
import Packet from 'App/Models/Packet'
import User from 'App/Models/User'
import axios from 'axios'
import { DateTime } from 'luxon'

const kolaybiApiKey = Config.get('kolaybi.apiKey')
const kolaybiApiUrl = Config.get('kolaybi.apiUrl')
const kolaybiChannel = Config.get('kolaybi.channel')

export default class KolaybiService {
  private kolaybiToken: string | null
  private endpoint: string

  constructor() {
    this.endpoint = kolaybiApiUrl
    this.kolaybiToken = null
  }

  private async auth() {
    if (this.kolaybiToken) {
      return this
    }

    const response = await axios.post(
      `${this.endpoint}/access_token`,
      {
        api_key: kolaybiApiKey,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Channel': kolaybiChannel,
        },
      }
    )

    if (response.data.success) {
      this.kolaybiToken = response.data.data
    } else {
      throw new Error('Kolaybi API token alınamadı.')
    }
  }

  public async api(method, path, payload = {}) {
    await this.auth()

    try {
      const result = await axios({
        method: method,
        url: `${this.endpoint}${path}`,
        headers: {
          'Authorization': `Bearer ${this.kolaybiToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Channel': kolaybiChannel,
        },
        data: payload,
      })

      return result.data || null
    } catch (error) {
      console.log('error', error)
      throw new Error('Kolaybi API iletişim hatası.')
    }
  }

  public async listProducts(name) {
    const response = await this.api('get', '/products', {
      name,
    })

    return response
  }

  public async createProduct(data) {
    const response = await this.api('post', '/products', {
      name: data.name,
    })

    if (!response.data.success) {
      throw new Error('Kolaybi API iletişim hatası.')
    }

    return response.data
  }

  public async createAssociate(data) {
    const response = await this.api('post', '/associates', {
      name: data.name,
      surname: data.surname,
      identity_no: data.identity_no,
    })

    if (!response.data.success) {
      throw new Error('Kolaybi API iletişim hatası.')
    }

    return response.data
  }

  public async listAssociates(code) {
    const response = await this.api('get', '/associates', {
      code,
    })

    return response
  }

  public async getProductId(packet: Packet) {
    const responseProductsList = await this.listProducts(packet.name)

    if (!responseProductsList.success) {
      throw new Error('Kolaybi API iletişim hatası.')
    }

    if (responseProductsList.data.length === 0) {
      const associate = await this.createProduct({
        name: packet.name,
      })

      return associate.data.id
    }

    return responseProductsList.data[0].id
  }

  public async getContactDetails(user: User) {
    const responseAssociatesList = await this.listAssociates(
      `USR${String(user.id).padStart(6, '0')}`
    )

    if (!responseAssociatesList.success) {
      throw new Error('Kolaybi API iletişim hatası.')
    }

    let associate: any = null
    let address: any = null

    if (responseAssociatesList.data.length === 0) {
      const newAssociate = await this.createAssociate({
        name: user.name,
        surname: user.surname,
      })

      associate = newAssociate.data
    }

    associate = responseAssociatesList.data[0]

    if (associate.address.length === 0) {
      await user.load('country')
      await user.load('city')

      if (!user.address) {
        throw new Error('Kullanıcı adres bilgisi eksik.')
      }

      if (!user.country) {
        throw new Error('Kullanıcı ülke bilgisi eksik.')
      }

      if (!user.city) {
        throw new Error('Kullanıcı şehir bilgisi eksik.')
      }

      const newAddress = await this.api('post', '/address/create', {
        associate_id: associate.id,
        address: user.address,
        country: user.country.id,
        city: user.city.id,
      })

      if (!newAddress.success) {
        throw new Error('Kolaybi API iletişim hatası.')
      }

      address = newAddress.data
    } else {
      address = associate.address[0]
    }

    return {
      associate,
      address,
    }
  }

  public async getOrdersForUser(user: User) {
    return await user
      .related('orders')
      .query()
      .where('type', OrderType.COIN)
      .whereNotNull('packet_id')
      .where('is_paid', true)
      .has('invoices', '<', 1)
      .preload('packet')
  }

  public async createInvoiceForUser(user: User) {
    const orders = await this.getOrdersForUser(user)

    if (orders.length === 0) {
      throw new Error('Faturalandırılacak sipariş bulunamadı.')
    }

    const { associate, address } = await this.getContactDetails(user)

    const items = await Promise.all(
      orders.map(async (order) => {
        const productId = await this.getProductId(order.packet)

        return {
          name: order.name,
          quantity: 1,
          product_id: productId,
          vat_rate: 18,
          unit_price: order.price,
        }
      })
    )

    const response = await this.api('post', '/invoices', {
      contact_id: associate.id,
      address_id: address.id,
      order_date: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
      currency: 'TRY',
      receiver_email: user.email,
      items,
    })

    return response.data
  }
}
