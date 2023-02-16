import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import UserRole from 'App/Enums/UserRole'
import Order from 'App/Models/Order'
import PaymentService from 'App/Services/PaymentService'
import User from '../../Models/User'
import NotificationService from '../../Services/NotificationService'

export default class OrderController {
  async index({ auth, request, response }: HttpContextContract) {
    const ordersQuery = Order.query()

    const user = await auth.authenticate()
    const isAdmin = user?.role === UserRole.ADMIN

    if (!isAdmin || request.input('user')) {
      if (user) {
        ordersQuery.where('user_id', user.id)
      }
    }

    if (request.input('type')) {
      ordersQuery.where('type', request.input('type'))
    }

    if (request.input('filter')) {
      ordersQuery
        .where('name', 'ilike', `%${request.input('filter')}%`)
        .orWhereHas('user', (query) => {
          query
            .where('username', 'ilike', `%${request.input('filter')}%`)
            .orWhere('email', 'ilike', `%${request.input('filter')}%`)
        })
    }

    const orders = await ordersQuery
      .preload('user')
      .preload('invoices')
      .orderBy('id', 'desc')
      .paginate(request.input('page', 1), request.input('take', 10))

    return response.send(orders)
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const order = await Order.findOrFail(params.id)

    try {
      await Database.transaction(async () => {
        const deleted = await Order.query().where('id', params.id).delete()

        const user = await User.query().where('id', order.user_id).firstOrFail()
        await user.syncBalance()

        await NotificationService.onDelete('orders', order.id)

        if (deleted.includes(1)) {
          return response.ok(true)
        } else {
          return response.notFound()
        }
      })
    } catch {
      return response.badRequest()
    }
  }

  public async callback({ response, request }: HttpContextContract) {
    const paymentService = new PaymentService()
    const isSuccess = await paymentService.verifyPayment(request)

    if (isSuccess) {
      return 'OK'
    } else {
      return response.badRequest()
    }
  }
}
