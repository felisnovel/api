import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invoice from 'App/Models/Invoice'
import InvoiceService from 'App/Services/InvoiceService'

export default class GetEInvoice {
  async invoke({ params, response }: HttpContextContract) {
    const invoice = await Invoice.query().where('e_invoice_uuid', params.uuid).firstOrFail()

    const invoiceService = new InvoiceService()
    const eInvoice = await invoiceService.getEInvoice(invoice)

    if (!eInvoice?.data?.src) {
      throw new Error('E-fatura bulunamadı.')
    }

    return response.type('application/pdf').send(Buffer.from(eInvoice.data.src, 'base64'))
  }
}
