import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserRequestValidator from 'App/Validators/UserRequestValidator'
import { isNumeric } from '../../../utils/index'
import Order from '../../Models/Order'
import AddCoinUserRequestValidator from '../../Validators/AddCoinUserRequestValidator'

export default class UserController {
  async index({ request, bouncer, response }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const usersQuery = User.query()

    if (request.input('all')) {
      const users = await usersQuery
      return response.json(users)
    } else {
      const users = await usersQuery.paginate(request.input('page', 1), request.input('take', 10))
      return response.json(users)
    }
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

    const mostLikedComments = await user
      .related('comments')
      .query()
      .preload('chapter', (query) => {
        query.preload('novel').preload('volume')
      })
      .withCount('likes')
      .withCount('dislikes')
      .orderBy('likes_count', 'desc')
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

  async addCoin({ params, request, response }: HttpContextContract) {
    const data = await request.validate(AddCoinUserRequestValidator)

    const user = await User.findOrFail(params.id)

    const order = await Order.create({
      type: data.type,
      name: data.name,
      user_id: user.id,
      amount: data.amount,
    })

    return response.json(order)
  }
}
