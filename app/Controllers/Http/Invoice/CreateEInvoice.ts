import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invoice from 'App/Models/Invoice'
import InvoiceService from 'App/Services/InvoiceService'

export default class CreateEInvoice {
  async invoke({ params, response }: HttpContextContract) {
    const invoice = await Invoice.findOrFail(params.invoice)

    const invoiceService = new InvoiceService()

    if (invoice.e_invoice_uuid) {
      throw new Error('Bu fatura zaten e-fatura olarak oluşturulmuş.')
    }

    await invoiceService.createEInvoice(invoice.document_id)

    return response.status(200).send({
      success: true,
      message: 'E-fatura başarıyla oluşturuldu.',
    })
  }
}
