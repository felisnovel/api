import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserFavoriteRequestValidator from 'App/Validators/UserFavoriteRequestValidator'

export default class FavoriteController {
  async index({ auth, response }: HttpContextContract) {
    const user = await auth.authenticate()
    await user.load('favorites')

    const favorites = user.favorites

    return response.send(favorites)
  }

  async store({ auth, request, response }: HttpContextContract) {
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

  async destroy({ auth, params, response }: HttpContextContract) {
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
