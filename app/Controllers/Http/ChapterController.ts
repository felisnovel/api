import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import UserRole from 'App/Enums/UserRole'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'
import Chapter from 'App/Models/Chapter'
import ChapterRequestValidator from 'App/Validators/ChapterRequestValidator'

export default class ChapterController {
  async index({ auth, request, response }: HttpContextContract) {
    const chaptersQuery = Chapter.query()
      .leftJoin('volumes', 'chapters.volume_id', 'volumes.id')
      .orderBy('volumes.volume_number', 'asc')
      .orderBy('chapters.number', 'asc')

    const user = await auth.authenticate()

    if (user?.role !== UserRole.ADMIN) {
      chaptersQuery.where('chapters.publish_status', ChapterPublishStatus.PUBLISHED)
    } else {
      if (request.input('publish_status')) {
        chaptersQuery.where('chapters.publish_status', request.input('publish_status'))
      }
    }

    if (request.input('fields')) {
      chaptersQuery.select(request.input('fields'))
    }

    if (request.input('volume_id')) chaptersQuery.where('volume_id', request.input('volume_id'))
    if (request.input('novel_id')) chaptersQuery.where('novel_id', request.input('novel_id'))

    if (request.input('all')) {
      const chapters = await chaptersQuery.preload('volume')

      return response.send(
        chapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          number: chapter.number,
          volume_number: chapter.volume.volume_number,
          volume_name: chapter.volume.name,
        }))
      )
    } else {
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

    const user = await auth.authenticate()

    const isAdmin = user?.role === UserRole.ADMIN

    if (!isAdmin) {
      chapterQuery.where('publish_status', ChapterPublishStatus.PUBLISHED)
    }

    const chapter = await chapterQuery.firstOrFail()

    const prevChapterQuery = chapter.novel.related('chapters').query()

    prevChapterQuery
      .where(function (query) {
        query.where('volume_id', '!=', chapter.volume_id).orWhere(function (orQuery) {
          orQuery.where('number', '<', chapter.number)
        })
      })
      .leftJoin('volumes', 'volumes.id', 'chapters.volume_id')
      .where('volumes.volume_number', '<=', chapter.volume.volume_number)
      .orderBy('volumes.volume_number', 'desc')
      .orderBy('number', 'desc')

    if (!isAdmin) {
      prevChapterQuery
        .where('volumes.publish_status', VolumePublishStatus.PUBLISHED)
        .where('chapters.publish_status', ChapterPublishStatus.PUBLISHED)
    }

    const prevChapter = await prevChapterQuery.first()

    const nextChapterQuery = chapter.novel.related('chapters').query()

    nextChapterQuery
      .where(function (query) {
        query.where('volume_id', '!=', chapter.volume_id).orWhere(function (orQuery) {
          orQuery.where('number', '>', chapter.number)
        })
      })
      .leftJoin('volumes', 'volumes.id', 'chapters.volume_id')
      .where('volumes.volume_number', '>=', chapter.volume.volume_number)
      .orderBy('volumes.volume_number', 'asc')
      .orderBy('number', 'asc')

    if (!isAdmin) {
      nextChapterQuery
        .where('volumes.publish_status', VolumePublishStatus.PUBLISHED)
        .where('chapters.publish_status', ChapterPublishStatus.PUBLISHED)
    }

    const nextChapter = await nextChapterQuery.first()

    let isRead = false

    if (user) {
      isRead = await chapter.isRead(user)
    }

    return response.json({
      ...chapter.toJSON(),
      isRead,
      prev_chapter: prevChapter,
      next_chapter: nextChapter,
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
