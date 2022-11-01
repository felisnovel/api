import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import UserRole from 'App/Enums/UserRole'
import Chapter from 'App/Models/Chapter'
import ChapterRequestValidator from 'App/Validators/ChapterRequestValidator'

export default class ChapterController {
  async index({ auth, request, response }: HttpContextContract) {
    const chaptersQuery = Chapter.query()

    const user = await auth.authenticate()

    if (user?.role !== UserRole.ADMIN) {
      chaptersQuery.where('publish_status', ChapterPublishStatus.PUBLISHED)
    }

    if (request.input('fields')) {
      chaptersQuery.select(request.input('fields'))
    }

    if (request.input('volume_id')) chaptersQuery.where('volume_id', request.input('volume_id'))

    const chapters = await chaptersQuery.paginate(request.input('page', 1))

    const chaptersJson = chapters.toJSON()

    if (user) {
      chaptersJson.data = await Promise.all(
        chaptersJson.data.map(async (item) => {
          const isRead = await item.isRead(user)

          return {
            ...item.toJSON(),
            is_read: isRead,
          }
        })
      )
    }

    return response.send(chaptersJson)
  }

  async show({ auth, request, params, response }: HttpContextContract) {
    const novel = request.input('novel')
    const shorthand = request.input('shorthand')
    const number = params.id

    if (!novel || !shorthand) {
      return response.badRequest('Missing number or shorthand')
    }

    const chapterQuery = Chapter.query()
      .where('number', number)
      .whereHas('novel', (query) => {
        query.where('slug', novel).where('shorthand', shorthand)
      })
      .preload('volume')
      .preload('novel')
      .preload('translator')
      .preload('editor')

    const user = await auth.authenticate()

    if (user?.role !== UserRole.ADMIN) {
      chapterQuery.where('publish_status', ChapterPublishStatus.PUBLISHED)
    }

    const chapter = await chapterQuery.firstOrFail()

    let isRead = false

    if (user) {
      isRead = await chapter.isRead(user)
    }

    return response.json({
      ...chapter.toJSON(),
      isRead,
    })
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
