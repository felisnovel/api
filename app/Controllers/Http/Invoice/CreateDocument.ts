import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invoice from 'App/Models/Invoice'
import InvoiceService from 'App/Services/InvoiceService'

export default class CreateDocument {
  async invoke({ params, response }: HttpContextContract) {
    const invoice = await Invoice.findOrFail(params.invoice)

    const invoiceService = new InvoiceService()
    await invoiceService.createDocument(invoice)

    return response.status(200).send({
      success: true,
      message: 'Fatura başarıyla oluşturuldu.',
    })
  }
}
