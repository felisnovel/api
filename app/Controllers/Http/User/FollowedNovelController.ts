import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class FollowedNovelController {
  async index({ auth, response }: HttpContextContract) {
    const user = await auth.authenticate()
    await user.load('followNovels')

    const followedNovels = user.followNovels

    return response.send(followedNovels)
  }
}
