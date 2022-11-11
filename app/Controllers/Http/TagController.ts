import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tag from 'App/Models/Tag'
import TagRequestValidator from 'App/Validators/TagRequestValidator'

export default class TagController {
  async index({ response }: HttpContextContract) {
    const tags = await Tag.query().orderBy('id', 'desc')

    return response.send(tags)
  }

  async show({ params, response }: HttpContextContract) {
    const tag = await Tag.findOrFail(params.id)

    return response.json(tag)
  }

  async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(TagRequestValidator)

    const tag = await Tag.create(data)

    return response.json(tag)
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(TagRequestValidator)

    const tag = await Tag.findOrFail(params.id)

    await tag.merge(data)
    await tag.save()

    return response.json(tag)
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    try {
      const deleted = await Tag.query().where('id', params.id).delete()

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
