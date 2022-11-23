import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import UserRole from 'App/Enums/UserRole'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'
import Chapter from 'App/Models/Chapter'
import ChapterRequestValidator from 'App/Validators/ChapterRequestValidator'
import showdown from 'showdown'

async function checkChapter(item, user, subscribed) {
  let isRead = false
  let isPurchased = false
  let isOpened = false

  if (user) {
    isRead = await item.isRead(user)
    isPurchased = await item.isPurchased(user)
    isOpened = !item.is_premium || isPurchased || subscribed?.premium_eps ? true : false
  }

  return {
    isRead,
    isPurchased,
    isOpened,
    context: isOpened ? item.context : item.context.slice(0, 200),
  }
}

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

      let subscribed = false
      if (user) {
        subscribed = await user.subscribed()
      }

      chaptersJson.data = await Promise.all(
        chaptersJson.data.map(async (item) => {
          const { isRead, isOpened, isPurchased, ...props } = await checkChapter(
            item,
            user,
            subscribed
          )

          return {
            ...item.toJSON(),
            ...props,
            context: null,
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

    let subscribed

    if (user) {
      subscribed = await user.subscribed()
    }

    const { isOpened, isRead, context } = await checkChapter(chapter, user, subscribed)

    const chapterProps = {
      context,
    }

    if (request.input('html') || !isAdmin) {
      const converter = new showdown.Converter()
      chapterProps.context = converter.makeHtml(chapterProps.context)
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
