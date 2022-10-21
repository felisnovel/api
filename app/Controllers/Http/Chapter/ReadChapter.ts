import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Chapter from '../../../Models/Chapter'

export default class ReadChapter {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const chapter = await Chapter.findOrFail(params.chapter)

    await user.related('readChapters').sync([chapter.id], false)

    return response.status(200).send({
      success: true,
    })
  }
}
