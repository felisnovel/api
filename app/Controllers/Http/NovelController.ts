import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Novel from 'App/Models/Novel'
import NovelRequestValidator from 'App/Validators/NovelRequestValidator'

export default class NovelController {
  async index({ response }: HttpContextContract) {
    const novels = await Novel.query()

    return response.send(novels)
  }

  async show({ params, auth, response }: HttpContextContract) {
    const novel = await Novel.findOrFail(params.id)

    const user = await auth.authenticate()

    let latestReadChapter

    if (user) {
      latestReadChapter = await novel.getLatestReadChapter(user.id)
    }

    return response.json({
      novel,
      latest_read_chapter: latestReadChapter,
    })
  }

  async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(NovelRequestValidator)

    const novel = await Novel.create(data)

    return response.json(novel)
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(NovelRequestValidator)

    const novel = await Novel.findOrFail(params.id)

    await novel.merge(data)
    await novel.save()

    return response.json(novel)
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    try {
      const deleted = await Novel.query().where('id', params.id).delete()

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
