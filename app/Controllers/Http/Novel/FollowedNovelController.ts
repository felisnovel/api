import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class FollowedNovelController {
  async invoke({ auth, response }: HttpContextContract) {
    const user = await auth.authenticate()
    await user.load('followNovels')

    const followedNovels = await user
      .related('followNovels')
      .query()
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })

    return response.send(followedNovels)
  }
}
