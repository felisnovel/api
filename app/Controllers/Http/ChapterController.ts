import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Chapter from 'App/Models/Chapter'
import ChapterRequestValidator from 'App/Validators/ChapterRequestValidator'

export default class ChapterController {
  async index({ response }: HttpContextContract) {
    const chapters = await Chapter.query()

    return response.send(chapters)
  }

  async show({ params, response }: HttpContextContract) {
    const chapter = await Chapter.findOrFail(params.id)

    return response.json(chapter)
  }

  async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(ChapterRequestValidator)

    const chapter = await Chapter.create(data)

    return response.json(chapter)
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(ChapterRequestValidator)

    const chapter = await Chapter.findOrFail(params.id)

    await chapter.merge(data)
    await chapter.save()

    return response.json(chapter)
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    try {
      const deleted = await Chapter.query().where('id', params.id).delete()

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
