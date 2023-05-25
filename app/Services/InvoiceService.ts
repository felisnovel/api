import Invoice from 'App/Models/Invoice'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import KolaybiService from './KolaybiService'
import OrderService from './OrderService'

export default class InvoiceService {
  private kolaybiService: KolaybiService

  constructor() {
    this.kolaybiService = new KolaybiService()
  }

  public async createEInvoice(document_id) {
    const documentDetail = await this.kolaybiService.getDocumentDetail(document_id)

    if (!documentDetail.success) {
      throw new Error('Fatura detayı alınamadı.')
    }

    if (documentDetail.data.uuid) {
      throw new Error('Fatura zaten e-arşiv olarak oluşturulmuş.')
    }

    const response = await this.kolaybiService.createEInvoice(document_id)

    await Invoice.query().where('document_id', document_id).update({
      e_invoice_uuid: response.data.uuid,
    })

    return response
  }

  public async getEInvoice(invoice: Invoice) {
    if (!invoice.e_invoice_uuid) {
      throw new Error('Bu fatura henüz e-fatura olarak oluşturulmamış.')
    }

    const eInvoiceView = await this.kolaybiService.getEDocumentView(invoice.e_invoice_uuid)

    return eInvoiceView
  }

  public async createDocumentForUser(user: User) {
    const invoice = await new OrderService().createInvoiceForUser(user)
    await invoice.load('orders')

    const document = await this.createDocument(invoice)

    return document
  }

  public async createEInvoiceForUser(user: User) {
    const document = await this.createDocumentForUser(user)
    const eInvoice = await this.createEInvoice(document.id)

    return eInvoice
  }

  public async getProductId(order) {
    const { name: productName } = order

    const responseProductsList = await this.kolaybiService.listProducts(productName)

    if (!responseProductsList.success) {
      throw new Error('Ürün id bulurken ürün listesi alınamadı.')
    }

    if (responseProductsList.data.length === 0) {
      const associate = await this.kolaybiService.createProduct({
        name: productName,
      })

      return associate.data.id
    }

    const product = responseProductsList.data[0]

    return product.id
  }

  public async createDocument(invoice: Invoice) {
    await invoice.load('user')
    const { user } = invoice

    if (invoice.document_id) {
      throw new Error('Fatura zaten oluşturulmuş.')
    }

    if (!user) {
      throw new Error('Fatura kullanıcısı bulunamadı.')
    }

    const { associate, address } = await this.kolaybiService.getContactDetails(user)

    await invoice.load('orders')

    if (!invoice.orders) {
      throw new Error('Fatura siparişleri bulunamadı.')
    }

    const items = await Promise.all(
      invoice.orders.map(async (order) => {
        const product_id = await this.kolaybiService.getProductId(order)

        return {
          id: order.id,
          name: order.name,
          quantity: 1,
          product_id,
          vat_rate: 18,
          unit_price: order.price ? (order.price * 100) / 118 : 0,
        }
      })
    )

    const response = await this.kolaybiService.createDocument({
      contact_id: associate.id,
      address_id: address.id,
      order_date: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
      currency: 'TRY',
      receiver_email: user.email,
      items,
    })

    const { data } = response

    await invoice.merge({
      document_id: data.document_id,
    })
    await invoice.save()

    return {
      id: data.document_id,
    }
  }
}
