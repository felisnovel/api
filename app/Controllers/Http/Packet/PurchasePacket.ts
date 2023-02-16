import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PaymentService from 'App/Services/PaymentService'
import Packet from '../../../Models/Packet'

export default class PurchasePacket {
  async invoke({ params, request, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const packet = await Packet.query().where('id', params.packet).firstOrFail()

    const payment_type = request.input('payment_type')

    const paymentService = await new PaymentService()

    return await paymentService.createPayment({
      user,
      packet,
      payment_type,
      user_ip: request.ip(),
    })
  }
}
