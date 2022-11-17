import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'
import OrderType from '../../../Enums/OrderType'
import Packet from '../../../Models/Packet'

export default class PurchasePacket {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const packet = await Packet.query().where('id', params.packet).firstOrFail()

    await user.related('orders').create({
      type: OrderType.COIN,
      name: packet.name,
      amount: packet.amount,
      price: packet.price,
      is_paid: true,
      packet_id: packet.id,
      starts_at: DateTime.local(),
    })

    return response.status(200).send({
      success: true,
    })
  }
}
