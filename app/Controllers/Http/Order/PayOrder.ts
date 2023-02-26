import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OrderService from 'App/Services/OrderService'
import Order from '../../../Models/Order'

export default class PayOrder {
  async invoke({ params, request, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const order = await Order.query().where('id', params.order).firstOrFail()

    const payment_type = request.input('payment_type')

    return await OrderService.pay({
      order,
      user,
      payment_type,
      user_ip: request.ip(),
    })
  }
}
