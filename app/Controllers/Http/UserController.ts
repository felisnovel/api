import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserRequestValidator from 'App/Validators/UserRequestValidator'

export default class UserController {
  async index({ response }: HttpContextContract) {
    const users = await User.query()

    return response.send(users)
  }

  async show({ params, response }: HttpContextContract) {
    const user = await User.findOrFail(params.id)

    await user.loadCount('followNovels').loadCount('comments').loadCount('reviews')

    const lastFiveComments = await user
      .related('comments')
      .query()
      .orderBy('created_at', 'desc')
      .limit(5)

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
