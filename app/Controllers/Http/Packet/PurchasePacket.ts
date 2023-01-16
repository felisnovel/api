import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PaytrService from 'App/Services/PaytrService'
import PurchasePacketRequestValidator from 'App/Validators/PurchasePacketRequestValidator'
import { DateTime } from 'luxon'
import OrderType from '../../../Enums/OrderType'
import Packet from '../../../Models/Packet'

export default class PurchasePacket {
  async invoke({ params, request, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const packet = await Packet.query().where('id', params.packet).firstOrFail()

    const data = await request.validate(PurchasePacketRequestValidator)

    const order = await user.related('orders').create({
      type: OrderType.COIN,
      name: packet.name,
      amount: packet.amount,
      price: packet.price,
      packet_id: packet.id,
      starts_at: DateTime.local(),
      payment_type: data.payment_type,
    })

    const iframeToken = await PaytrService.createIframeToken(order, {
      ip: request.ip(),
      data,
    })

    return response.status(200).send({
      iframeToken,
    })
  }
}
