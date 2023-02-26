import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Packet from 'App/Models/Packet'
import PacketService from 'App/Services/PacketService'

export default class PurchasePacket {
  async invoke({ response, params, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const packet = await Packet.query().where('id', params.packet).firstOrFail()

    const order = await PacketService.createOrder({
      user,
      packet,
    })

    return response.status(200).send({
      success: true,
      order,
    })
  }
}
