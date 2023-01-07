import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import UserRole from 'App/Enums/UserRole'
import Novel from 'App/Models/Novel'
import NovelRequestValidator from 'App/Validators/NovelRequestValidator'
import showdown from 'showdown'
import { isNumeric } from '../../../utils'

export default class NovelController {
  async index({ auth, response, request }: HttpContextContract) {
    const novelsQuery = Novel.query()

    const user = await auth.authenticate()

    const isAdmin = user?.role === UserRole.ADMIN

    if (!isAdmin) {
      novelsQuery.where('publish_status', NovelPublishStatus.PUBLISHED)
    } else {
      novelsQuery.preload('user')

      if (request.input('publish_status')) {
        novelsQuery.where('novels.publish_status', request.input('publish_status'))
      }
    }

    if (request.input('filter')) {
      novelsQuery
        .where('name', 'ilike', `%${request.input('filter')}%`)
        .orWhere('other_names', 'ilike', `%${request.input('filter')}%`)
        .orWhere('shorthand', 'ilike', `%${request.input('filter')}%`)
    }

    if (request.input('tags')) {
      const tags = request.input('tags').split(',')

      for (const tag of tags) {
        novelsQuery.whereExists((query) => {
          query
            .select('*')
            .from('novel_tag')
            .whereColumn('novel_tag.novel_id', 'novels.id')
            .where('novel_tag.tag_id', tag)
        })
      }
    }

    const novels = await novelsQuery
      .preload('country')
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .orderBy('id', 'desc')
      .paginate(request.input('page', 1), request.input('take', 10))

    const fields = request
      .input('fields')
      ?.split(',')
      ?.filter((x) => x !== 'context')

    if (fields) {
      const novelsJSON = novels.toJSON()

      return response.send({
        ...novelsJSON,
        data: novelsJSON.data.map((novel) => {
          const result = {}
          for (const field of fields) {
            result[field] = novel[field]
          }
          return result
        }),
      })
    }

    return response.send(novels)
  }

  async show({ request, params, auth, response }: HttpContextContract) {
    const { id } = params

    const novelQuery = Novel.query()
    if (isNumeric(id)) {
      novelQuery.where('id', params.id)
    } else {
      novelQuery.where('slug', params.id)
    }

    const user = await auth.authenticate()

    const isAdmin = user?.role === UserRole.ADMIN

    if (!isAdmin) {
      novelQuery.where('publish_status', NovelPublishStatus.PUBLISHED)
    }

    const novel: Novel = await novelQuery
      .preload('volumes', (query) => {
        if (!isAdmin) {
          query.where('publish_status', NovelPublishStatus.PUBLISHED)
        }
      })
      .preload('tags')
      .preload('country')
      .preload('first_chapter')
      .withCount('chapters', (query) => {
        query.where('publish_status', NovelPublishStatus.PUBLISHED)
      })
      .withCount('likers')
      .withCount('followers')
      .firstOrFail()

    let latestReadChapter
    let isLiked = false
    let isFollowed = false

    if (user) {
      latestReadChapter = await novel.getLatestReadChapter(user.id)

      isLiked = await novel.isLiked(user)
      isFollowed = await novel.isFollowed(user)
    }

    const novelProps: any = {}

    if (isAdmin && request.input('md')) {
      novelProps.context = novel.context
    }

    return response.json({
      ...novel.toJSON(),
      ...novelProps,
      is_liked: isLiked,
      is_followed: isFollowed,
      latest_read_chapter: latestReadChapter,
    })
  }

  async store({ request, auth, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(NovelRequestValidator)

    const user = await auth.authenticate()

    const novel = await Novel.create({
      ...data,
      user_id: user.id,
    })

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

  async popular({ auth, response }: HttpContextContract) {
    const novelsQuery = Novel.query()

    const user = await auth.authenticate()

    const isAdmin = user?.role === UserRole.ADMIN
    if (!isAdmin) {
      novelsQuery.where('publish_status', NovelPublishStatus.PUBLISHED)
    }

    const novels = await novelsQuery
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .withCount('likers')
      .withCount('views')
      .orderBy('views_count', 'desc')
      .limit(7)

    return response.send(novels)
  }

  async promoted({ auth, response }: HttpContextContract) {
    const novelsQuery = Novel.query()

    const user = await auth.authenticate()

    const isAdmin = user?.role === UserRole.ADMIN
    if (!isAdmin) {
      novelsQuery.where('publish_status', NovelPublishStatus.PUBLISHED)
    }

    const novels = await novelsQuery
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .where('is_promoted', true)
      .limit(10)

    return response.send(novels)
  }

  async random({ auth, response }: HttpContextContract) {
    const novelsQuery = Novel.query()

    const user = await auth.authenticate()

    const isAdmin = user?.role === UserRole.ADMIN
    if (!isAdmin) {
      novelsQuery.where('publish_status', NovelPublishStatus.PUBLISHED)
    }

    const novels = await novelsQuery
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

    const user = await auth.authenticate()

    const isAdmin = user?.role === UserRole.ADMIN
    if (!isAdmin) {
      lastUpdatedNovelsQuery.where('novels.publish_status', NovelPublishStatus.PUBLISHED)
    }

    if (request.input('followed')) {
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

    const showdownService = new showdown.Converter()

    return response.send(
      lastUpdatedNovels.map((novel) => {
        const body = showdownService.makeHtml(novel.context)
        return {
          ...novel,
          body,
          context: null,
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

  async lastNovels({ auth, response }: HttpContextContract) {
    const novelsQuery = Novel.query()

    const user = await auth.authenticate()

    const isAdmin = user?.role === UserRole.ADMIN
    if (!isAdmin) {
      novelsQuery.where('publish_status', NovelPublishStatus.PUBLISHED)
    }

    const novels = await novelsQuery
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .orderBy('created_at', 'desc')
      .limit(3)

    return response.send(novels)
  }

  async ogImage({ params, response }: HttpContextContract) {
    const novel = await Novel.query()
      .where('slug', params.slug)
      .select('image', 'author', 'name')
      .limit(1)

    const { name, author, image } = novel[0]

    return response.json({
      name,
      image,
      author,
    })
  }
}
