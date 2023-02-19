import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Order from 'App/Models/Order'
import OrderService from 'App/Services/OrderService'

export default class UpdateOrderStatus {
  async invoke({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const order = await Order.query().where('id', params.order).firstOrFail()

    await OrderService.updateStatus(order, params.status)

    return response.json({
      status: 'success',
      message: 'İşlem durumu başarıyla güncellendi.',
    })
  }
}
