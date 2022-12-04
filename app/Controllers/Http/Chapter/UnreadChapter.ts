import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Chapter from '../../../Models/Chapter'

export default class UnreadChapter {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    const chapter = await Chapter.query().where('id', params.chapter).firstOrFail()

    await user.related('readChapters').detach([chapter.id])

    return response.status(200).send({
      success: true,
    })
  }
}
