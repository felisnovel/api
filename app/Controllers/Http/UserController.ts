import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserRequestValidator from 'App/Validators/UserRequestValidator'
import { isNumeric } from '../../../utils/index'

export default class UserController {
  async index({ bouncer, response }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const users = await User.query()

    return response.send(users)
  }

  async show({ params, response }: HttpContextContract) {
    const { id } = params

    const userQuery = User.query()
    if (isNumeric(id)) {
      userQuery.where('id', params.id)
    } else {
      userQuery.where('slug', params.id)
    }

    const user = await userQuery.firstOrFail()

    const lastFiveComments = await user
      .related('comments')
      .query()
      .orderBy('created_at', 'desc')
      .limit(5)

    await user.loadCount('followNovels').loadCount('comments').loadCount('reviews')
    await user.serialize()

    return response.json({
      user,
      lastFiveComments,
      // mostLikedComment,
    })
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(UserRequestValidator)

    const user = await User.findOrFail(params.id)

    await user.merge(data)
    await user.save()

    return response.json(user)
  }
}
