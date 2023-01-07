import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Chapter from 'App/Models/Chapter'
import { DateTime } from 'luxon'

export default class ViewChapter {
  async invoke({ params, request, response }: HttpContextContract) {
    const chapter = await Chapter.findOrFail(params.chapter)

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

    return response.status(200).send({
      success: true,
    })
  }
}
