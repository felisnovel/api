import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import InvoiceService from 'App/Services/InvoiceService'

export default class CreateEInvoice {
  async invoke({ response, params }: HttpContextContract) {
    const user = await User.query().where('id', params.id).firstOrFail()

    const invoiceService = new InvoiceService()
    await invoiceService.createEInvoiceForUser(user)

    return response.status(200).send({
      success: true,
      message: 'Dönem faturası (e-fatura) başarıyla oluşturuldu.',
    })
  }
}
