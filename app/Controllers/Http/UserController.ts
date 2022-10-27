import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
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
      userQuery.where('username', params.id)
    }

    const user = await userQuery.firstOrFail()

    const lastFiveComments = await user
      .related('comments')
      .query()
      .orderBy('created_at', 'desc')
      .limit(5)

    const mostLikedComments = await Database.query()
      .select(
        'comments.*',
        Database.rawQuery(
          '(SELECT COUNT(*) FROM comment_reactions WHERE type = ? AND comment_reactions.comment_id = comments.id) AS comments_reactions_count',
          ['like']
        )
      )
      .from('comments')
      .orderBy('comments_reactions_count', 'desc')
      .limit(2)

    await user.loadCount('followNovels').loadCount('comments').loadCount('reviews')
    await user.serialize()

    return response.json({
      user,
      last_five_comments: lastFiveComments,
      most_liked_comments: mostLikedComments,
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
