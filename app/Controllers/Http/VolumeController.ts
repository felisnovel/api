import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Volume from 'App/Models/Volume'
import VolumeRequestValidator from 'App/Validators/VolumeRequestValidator'

export default class VolumeController {
  async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(VolumeRequestValidator)

    const volume = await Volume.create(data)

    return response.json(volume)
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(VolumeRequestValidator)

    const volume = await Volume.findOrFail(params.id)

    await volume.merge(data)
    await volume.save()

    return response.json(volume)
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    try {
      const deleted = await Volume.query().where('id', params.id).delete()

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
