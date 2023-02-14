import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserRole from 'App/Enums/UserRole'
import Invoice from 'App/Models/Invoice'

export default class InvoiceController {
  async index({ auth, request, response }: HttpContextContract) {
    const invoicesQuery = Invoice.query()

    const user = await auth.authenticate()
    const isAdmin = user?.role === UserRole.ADMIN

    if (!isAdmin || request.input('user')) {
      if (user) {
        invoicesQuery.where('user_id', user.id)
      }
    }

    const invoices = invoicesQuery
      .preload('user')
      .orderBy('id', 'desc')
      .paginate(request.input('page', 1), request.input('take', 10))

    return response.send(invoices)
  }

  public async destroy({ response, params }: HttpContextContract) {
    try {
      const deleted = await Invoice.query().where('id', params.id).delete()

      if (deleted.includes(1)) {
        return response.ok(true)
      } else {
        return response.notFound()
      }
    } catch {
      return response.badRequest()
    }
  }
}
