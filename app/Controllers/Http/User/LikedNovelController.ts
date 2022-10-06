import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LikedNovelController {
  async index({ auth, response }: HttpContextContract) {
    const user = await auth.authenticate()
    await user.load('likeNovels')

    const likedNovels = user.likeNovels

    return response.send(likedNovels)
  }
}
