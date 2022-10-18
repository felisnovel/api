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
    const lastUpdatedNovels = await Database.from('novels')
      .joinRaw(
        'LEFT JOIN (SELECT novel_id, MAX(created_at) AS last_chapter FROM chapters GROUP BY novel_id, volume_id) ' +
          'AS last_chapters ON last_chapters.novel_id = novels.id ' +
          'LEFT JOIN chapters ON chapters.novel_id = last_chapters.novel_id ' +
          'AND chapters.created_at = last_chapters.last_chapter'
      )
      .select(
        'novels.*',
        'chapters.number as last_chapter_number',
        'chapters.title as last_chapter_title'
      )
      .orderBy('chapters.created_at', 'desc')
      .limit(8)

    return response.send(
      lastUpdatedNovels.map((novel) => ({
        ...novel,
        latest_chapter: {
          title: novel.last_chapter_title,
          number: novel.last_chapter_number,
          volume: {
            volume_number: novel.last_chapter_volume_number,
          },
        },
      }))
    )
  }
}
