import Config from '@ioc:Adonis/Core/Config'
import User from 'App/Models/User'
import axios from 'axios'

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
      console.log('resul', error)
      throw new Error('Kolaybi API iletişim hatası.')
    }
  }

  public async listProducts(name) {
    const response = await this.api('get', `/products?name=${name}`)

    return response
  }

  public async createProduct(data) {
    const response = await this.api('post', '/products', data)

    if (!response.data.success) {
      throw new Error('Ürün oluşturulurken hata oluştu.')
    }

    return response.data
  }

  public async updateProduct(id, data) {
    const response = await this.api('put', `/products/${id}`, data)

    if (!response.success) {
      throw new Error('Ürün güncellenirken hata oluştu.')
    }

    return response.data
  }

  public async createAssociate(data) {
    try {
      const response = await this.api('post', '/associates', {
        ...data,
        identity_no: data.identity_no || '11111111111',
      })

      if (!response.success) {
        throw new Error('Müşteri oluşturulurken hata oluştu.')
      }

      return response.data
    } catch (error) {
      if (error.response.data?.message === 'MODEL.ALREADY_EXISTS') {
        const responseAssociatesList = await this.listAssociates(data.code)

        if (!responseAssociatesList.success) {
          throw new Error('Yeni müşteri oluştururken müşteri listesi alınamadı.')
        }

        const associate = responseAssociatesList.data[0]

        return associate
      }
    }
  }

  public async listAssociates(code) {
    const response = await this.api('get', `/associates?code=${code}`)

    return response
  }

  public async getProductId(order) {
    const { name: productName } = order

    const responseProductsList = await this.listProducts(productName)

    if (!responseProductsList.success) {
      throw new Error('Ürün id bulurken ürün listesi alınamadı.')
    }

    if (responseProductsList.data.length === 0) {
      const associate = await this.createProduct({
        name: productName,
      })

      return associate.data.id
    }

    const product = responseProductsList.data[0]

    return product.id
  }

  public async createAddress(data) {
    const newAddress = await this.api('post', '/address/create', data)

    if (!newAddress.success) {
      throw new Error('İletişim bilgileri alınırken yeni adres oluşturulamadı.')
    }

    return newAddress.data
  }

  public async getContactDetails(user: User) {
    const code = `USR${String(user.id).padStart(6, '0')}`
    const responseAssociatesList = await this.listAssociates(code)

    if (!responseAssociatesList.success) {
      throw new Error('İletişim bilgileri alınırken müşteri listesi alınamadı.')
    }

    let associate: any = null
    let address: any = null

    if (responseAssociatesList.data.length === 0) {
      const newAssociate = await this.createAssociate({
        code,
        name: user.name,
        surname: user.surname,
      })

      associate = newAssociate
    } else {
      associate = responseAssociatesList.data[0]
    }

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
        country: user.country.name,
        city: user.city.name,
      })

      if (!newAddress.success) {
        throw new Error('İletişim bilgileri alınırken yeni adres oluşturulamadı.')
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

  public async getDocumentDetail(document_id) {
    const response = await this.api('get', `/invoices/${document_id}`)

    return response
  }

  public async createEInvoice(document_id) {
    const response = await this.api('post', '/invoices/e-document/create', {
      document_id,
    })

    return response
  }

  public async createDocument(data) {
    const response = await this.api('post', '/invoices', data)

    return response
  }

  public async getEDocumentView(uuid) {
    const response = await this.api('get', `/invoices/e-document/view?uuid=${uuid}`)

    return response
  }
}
