import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import UserRole from 'App/Enums/UserRole'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'
import Chapter from 'App/Models/Chapter'
import ChapterRequestValidator from 'App/Validators/ChapterRequestValidator'
import { DateTime } from 'luxon'
import showdown from 'showdown'
import { getRandomInt, replaceAllWithId } from '../../../utils'
import ChapterService from '../../Services/ChapterService'
import NotificationService from '../../Services/NotificationService'

export default class ChapterController {
  async index({ auth, request, response }: HttpContextContract) {
    const user = await auth.authenticate()
    const isAdmin = user?.role === UserRole.ADMIN

    const chaptersQuery = Chapter.query()
      .whereHas('volume', (query) => {
        if (!isAdmin) {
          query.where('publish_status', VolumePublishStatus.PUBLISHED)
        }
      })
      .whereHas('novel', (query) => {
        if (!isAdmin) {
          query.where('publish_status', NovelPublishStatus.PUBLISHED)
        }
      })
      .join('volumes', 'chapters.volume_id', 'volumes.id')
      .orderBy('volumes.volume_number', 'asc')
      .orderBy('chapters.number', 'asc')
      .select('chapters.*')
      .preload('novel')
      .preload('volume')

    if (!isAdmin) {
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
      const chapters = await chaptersQuery.paginate(
        request.input('page', 1),
        request.input('take', 10)
      )

      const chaptersJson = chapters.toJSON()

      chaptersJson.data = await Promise.all(
        chaptersJson.data.map(async (item) => {
          const isRead = await item.isRead(user)
          const { isOpened, isPurchased } = await item.checkUser(user)

          return {
            ...item.toJSON(),
            is_read: isRead,
            is_opened: isOpened,
            is_purchased: isPurchased,
          }
        })
      )

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
      .withCount('views')

    const user = await auth.authenticate()

    const isAdmin = user?.role === UserRole.ADMIN

    if (!isAdmin) {
      chapterQuery.where('publish_status', ChapterPublishStatus.PUBLISHED)
    }

    const chapter = await chapterQuery.firstOrFail()

    const prevChapter = await ChapterService.getPrevChapter(chapter, !isAdmin)
    const nextChapter = await ChapterService.getNextChapter(chapter, !isAdmin)

    const { isOpened } = await chapter.checkUser(user)
    const isRead = await chapter.isRead(user)

    let body = chapter.body

    if (isOpened) {
      body = chapter.context
    }

    body = new showdown.Converter({
      strikethrough: true,
    }).makeHtml(body)

    body = replaceAllWithId(
      body,
      '[TN]',
      () => `<span class="tn_tag" id="tn_tag_${getRandomInt(100000, 999999)}">`
    ).replaceAll('[/TN]', '</span>')

    const chapterProps: any = {
      body,
    }

    if (isAdmin && request.input('md')) {
      chapterProps.context = chapter.context
      chapterProps.translation_note = chapter.translation_note
    } else {
      chapterProps.translation_note = new showdown.Converter({
        strikethrough: true,
      }).makeHtml(chapter.translation_note)
    }

    const ip = request.ip()
    if (ip) {
      const view = await chapter
        .related('views')
        .query()
        .whereBetween('created_at', [
          DateTime.local().minus({ days: 1 }).toFormat('yyyy-MM-dd'),
          DateTime.local().plus({ days: 1 }).toFormat('yyyy-MM-dd'),
        ])
        .where('ip', ip)
        .first()

      if (!view) await chapter.related('views').create({ ip })
    }

    return response.json({
      ...chapter.toJSON(),
      ...chapterProps,
      is_read: isRead,
      is_opened: isOpened,
      prev_chapter: prevChapter,
      next_chapter: nextChapter,
    })
  }

  async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(ChapterRequestValidator)

    const chapter = await Chapter.create(data)
    await chapter.load('novel')
    await chapter.load('volume')

    await NotificationService.onChapter(chapter)

    return response.json(chapter)
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(ChapterRequestValidator)

    const chapter = await Chapter.findOrFail(params.id)

    await chapter.merge(data)
    await chapter.save()

    await chapter.load('novel')
    await chapter.load('volume')

    await NotificationService.onChapter(chapter)

    return response.json(chapter)
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    try {
      const deleted = await Chapter.query().where('id', params.id).delete()

      if (deleted.includes(1)) {
        await NotificationService.onDelete('chapters', params.id)

        return response.ok(true)
      } else {
        return response.notFound()
      }
    } catch {
      return response.badRequest()
    }
  }
}
