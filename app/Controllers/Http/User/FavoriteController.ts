import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserFavoriteRequestValidator from 'App/Validators/UserFavoriteRequestValidator'

export default class FavoriteController {
  async index({ request, response }: HttpContextContract) {
    const user = await User.findByOrFail('username', request.input('username'))
    await user.load('favorites')

    const favorites = user.favorites

    return response.send(favorites)
  }

  async store({ bouncer, auth, request, response }: HttpContextContract) {
    await bouncer.authorize('auth')

    const user = await auth.authenticate()

    const data = await request.validate(UserFavoriteRequestValidator)

    await user.related('favorites').sync(
      {
        [data.novel_id]: {
          order: data.order,
        },
      },
      false
    )

    return response.send({
      success: true,
    })
  }

  async destroy({ bouncer, auth, params, response }: HttpContextContract) {
    await bouncer.authorize('auth')

    const user = await auth.authenticate()

    const favorite = await user
      .related('favorites')
      .query()
      .where('novel_id', params.id)
      .firstOrFail()

    await user.related('favorites').detach([favorite.id])

    return response.send({
      success: true,
    })
  }
}
