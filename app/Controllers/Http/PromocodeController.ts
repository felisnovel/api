import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Promocode from 'App/Models/Promocode'
import PromocodeRequestValidator from 'App/Validators/PromocodeRequestValidator'

export default class PromocodeController {
  async index({ request, response }: HttpContextContract) {
    const promocodes = await Promocode.query()
      .orderBy('id', 'desc')
      .paginate(request.input('page', 1), request.input('take', 10))

    return response.send(promocodes)
  }

  async store({ request, response }: HttpContextContract) {
    const data = await request.validate(PromocodeRequestValidator)

    const promocode = await Promocode.create(data)

    return response.json(promocode)
  }

  async update({ params, request, response }: HttpContextContract) {
    const data = await request.validate(PromocodeRequestValidator)

    const promocode = await Promocode.findOrFail(params.id)

    await promocode.merge(data)
    await promocode.save()

    return response.json(promocode)
  }

  public async destroy({ response, params }: HttpContextContract) {
    try {
      const deleted = await Promocode.query().where('id', params.id).delete()

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
