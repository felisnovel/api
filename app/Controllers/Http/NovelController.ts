import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import UserRole from 'App/Enums/UserRole'
import Novel from 'App/Models/Novel'
import NovelRequestValidator from 'App/Validators/NovelRequestValidator'
import { isNumeric } from '../../../utils'

export default class NovelController {
  async index({ auth, response, request }: HttpContextContract) {
    const novelsQuery = Novel.query()

    const user = await auth.authenticate()

    if (user?.role !== UserRole.ADMIN) {
      novelsQuery.where('publish_status', NovelPublishStatus.PUBLISHED)
    }

    const novels = await novelsQuery
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .paginate(request.input('page', 1))

    return response.send(novels)
  }

  async show({ params, auth, response }: HttpContextContract) {
    const { id } = params

    const novelQuery = Novel.query()
    if (isNumeric(id)) {
      novelQuery.where('id', params.id)
    } else {
      novelQuery.where('slug', params.id)
    }

    const user = await auth.authenticate()

    const isAdmin = user?.role === UserRole.ADMIN
    if (isAdmin) {
      novelQuery.where('publish_status', NovelPublishStatus.PUBLISHED)
    }

    const novel: Novel = await novelQuery
      .preload('volumes', (query) => {
        if (!isAdmin) {
          query.where('publish_status', NovelPublishStatus.PUBLISHED)
        }
      })
      .preload('editor')
      .preload('translator')
      .preload('tags')
      .preload('first_chapter')
      .withCount('chapters', (query) => {
        query.where('publish_status', NovelPublishStatus.PUBLISHED)
      })
      .withCount('likers')
      .withCount('followers')
      .where('publish_status', NovelPublishStatus.PUBLISHED)
      .firstOrFail()

    let latestReadChapter
    let isLiked = false
    let isFollowed = false

    if (user) {
      latestReadChapter = await novel.getLatestReadChapter(user.id)

      isLiked = await novel.isLiked(user)
      isFollowed = await novel.isFollowed(user)
    }

    return response.json({
      ...novel.toJSON(),
      is_liked: isLiked,
      is_followed: isFollowed,
      latest_read_chapter: latestReadChapter,
    })
  }

  async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(NovelRequestValidator)

    const novel = await Novel.create(data)

    if (data?.tags) {
      await novel.related('tags').sync(data.tags)
    }

    await novel.load('tags')

    return response.json(novel)
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(NovelRequestValidator)

    const novel = await Novel.findOrFail(params.id)

    await novel.merge(data)
    await novel.save()

    if (data?.tags) {
      await novel.related('tags').sync(data.tags)
    }

    await novel.load('tags')

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

  async popular({ response }: HttpContextContract) {
    const novels = await Novel.query()
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .withCount('likers')
      .orderBy('view_count', 'desc')
      .limit(7)

    return response.send(novels)
  }

  async promoted({ response }: HttpContextContract) {
    const novels = await Novel.query()
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .where('is_promoted', true)
      .limit(10)

    return response.send(novels)
  }

  async random({ response }: HttpContextContract) {
    const novels = await Novel.query()
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .withCount('likers')
      .orderByRaw('RANDOM()')
      .limit(4)

    return response.send(novels)
  }

  async lastUpdated({ auth, request, response }: HttpContextContract) {
    const lastUpdatedNovelsQuery = Database.query()
      .select(
        'novels.*',
        'chapters.number as latest_chapter_number',
        'chapters.title as latest_chapter_title',
        'volumes.volume_number as latest_chapter_volume_number',
        'volumes.created_at as latest_chapter_created_at'
      )
      .from('novels')
      .joinRaw(
        'inner join (select max(created_at) as last_chapter, novel_id from chapters group by novel_id) maxchapters on (novels.id = maxchapters.novel_id)'
      )
      .innerJoin('chapters', (query) => {
        query
          .on('maxchapters.last_chapter', '=', 'chapters.created_at')
          .on('novels.id', '=', 'chapters.novel_id')
      })
      .leftJoin('volumes', 'chapters.volume_id', 'volumes.id')
      .orderBy('chapters.created_at', 'desc')

    if (request.input('followed')) {
      const user = await auth.authenticate()

      if (!user) {
        return response.unauthorized()
      }

      lastUpdatedNovelsQuery
        .join('novel_follow', 'novels.id', 'novel_follow.novel_id')
        .where('novel_follow.user_id', user.id)
        .limit(5)
    } else {
      lastUpdatedNovelsQuery.limit(8)
    }

    const lastUpdatedNovels = await lastUpdatedNovelsQuery

    return response.send(
      lastUpdatedNovels.map((novel) => {
        return {
          ...novel,
          latest_chapter: {
            created_at: novel.latest_chapter_created_at,
            number: novel.latest_chapter_number,
            title: novel.latest_chapter_title,
            volume: {
              volume_number: novel.latest_chapter_volume_number,
            },
          },
        }
      })
    )
  }

  async lastNovels({ response }: HttpContextContract) {
    const novels = await Novel.query()
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .orderBy('created_at', 'desc')
      .limit(3)

    return response.send(novels)
  }
}
