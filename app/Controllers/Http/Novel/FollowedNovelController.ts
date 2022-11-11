import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class FollowedNovelController {
  async invoke({ request, auth, response }: HttpContextContract) {
    const user = await auth.authenticate()
    await user.load('followNovels')

    const followedNovels = await user
      .related('followNovels')
      .query()
      .preload('latest_chapter', (query) => {
        query.preload('volume')
      })
      .paginate(request.input('page', 1), request.input('take', 10))

    return response.send(followedNovels)
  }
}
