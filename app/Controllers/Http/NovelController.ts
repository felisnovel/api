import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Novel from 'App/Models/Novel'
import NovelRequestValidator from 'App/Validators/NovelRequestValidator'

export default class NovelController {
  async index({ response, request }: HttpContextContract) {
    const novels = await Novel.query()
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .paginate(request.input('page', 1))

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

  async lastUpdated({ response }: HttpContextContract) {
    const latestUpdatedNovels = await Database.query()
      .select(
        'novels.*',
        'chapters.number as latest_chapter_number',
        'chapters.title as latest_chapter_title',
        'volumes.volume_number as latest_chapter_volume_number'
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
      .limit(8)

    return response.send(
      latestUpdatedNovels.map((novel) => {
        return {
          ...novel,
          latest_chapter: {
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
