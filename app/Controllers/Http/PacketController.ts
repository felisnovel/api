import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Packet from 'App/Models/Packet'
import PacketRequestValidator from 'App/Validators/PacketRequestValidator'

export default class PacketController {
  async index({ response }: HttpContextContract) {
    const packets = await Packet.query().orderBy('id', 'desc')

    return response.send(packets)
  }

  async show({ params, response }: HttpContextContract) {
    const packet = await Packet.findOrFail(params.id)

    return response.json(packet)
  }

  async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(PacketRequestValidator)

    const packet = await Packet.create(data)

    return response.json(packet)
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(PacketRequestValidator)

    const packet = await Packet.findOrFail(params.id)

    await packet.merge(data)
    await packet.save()

    return response.json(packet)
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    try {
      const deleted = await Packet.query().where('id', params.id).delete()

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
