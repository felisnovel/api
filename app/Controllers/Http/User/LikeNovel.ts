import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Novel from 'App/Models/Novel'

export default class LikeNovel {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const novel = await Novel.findOrFail(params.novel)

    await user.related('likeNovels').sync([novel.id], false)

    return response.status(200).send({
      success: true,
    })
  }
}
