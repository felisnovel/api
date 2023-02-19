import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DateFormat from 'App/constants/DateFormat'
import Review from 'App/Models/Review'
import UpdateReviewRequestValidator from 'App/Validators/UpdateReviewRequestValidator'
import { format } from 'date-fns'
import NotificationService from '../../Services/NotificationService'
import CreateReviewRequestValidator from '../../Validators/CreateReviewRequestValidator'

export default class ReviewController {
  async index({ request, auth, response }: HttpContextContract) {
    const user = await auth.authenticate()

    // if (!request.input('novel_id') && user?.role !== UserRole.ADMIN) {
    //  return response.badRequest()
    // }

    const reviewsQuery = Review.query()

    if (request.input('novel_id')) {
      reviewsQuery.where('novel_id', request.input('novel_id'))
    }

    const reviews = await reviewsQuery
      .preload('user')
      .preload('novel')
      .withCount('likes')
      .withCount('dislikes')
      .orderBy('is_pinned', 'desc')
      .orderBy('created_at', 'desc')
      .paginate(request.input('page', 1), request.input('take', 10))

    const reviewsJson = reviews.toJSON()

    if (user) {
      reviewsJson.data = await Promise.all(
        reviewsJson.data.map(async (item) => {
          const isLiked = await item.isLiked(user)
          const isDisliked = await item.isDisliked(user)

          return {
            ...item.toJSON(),
            is_liked: isLiked,
            is_disliked: isDisliked,
          }
        })
      )
    }

    return response.send(reviewsJson)
  }

  async store({ bouncer, request, auth, response }: HttpContextContract) {
    await bouncer.authorize('auth')
    const user = await auth.authenticate()

    if (user.mutedAt) {
      return response.unauthorized({
        status: 'failure',
        message: `Belirtilen tarihe kadar inceleme yapamazsınız. (${format(
          user.mutedAt.toJSDate(),
          DateFormat
        )})`,
      })
    }

    const data = await request.validate(CreateReviewRequestValidator)

    const review = await Review.create({
      ...data,
      user_id: user.id,
    })

    await NotificationService.onReview(review)

    return response.json(review)
  }

  async update({ params, bouncer, auth, request, response }: HttpContextContract) {
    await bouncer.authorize('auth')
    const user = await auth.authenticate()

    if (user.mutedAt) {
      return response.unauthorized({
        status: 'failure',
        message: `Belirtilen tarihe kadar inceleme güncelleyemezsiniz. (${format(
          user.mutedAt.toJSDate(),
          DateFormat
        )})`,
      })
    }

    const review = await Review.findOrFail(params.id)

    if (review.user_id !== user.id) {
      await bouncer.authorize('isAdmin')
    }

    const data = await request.validate(UpdateReviewRequestValidator)

    await review.merge(data)
    await review.save()

    return response.json(review)
  }

  public async destroy({ auth, response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('auth')
    const user = await auth.authenticate()

    if (user.mutedAt) {
      return response.unauthorized({
        status: 'failure',
        message: `Belirtilen tarihe kadar inceleme silemezsiniz. (${format(
          user.mutedAt.toJSDate(),
          DateFormat
        )})`,
      })
    }

    const review = await Review.findOrFail(params.id)

    if (review.user_id !== user.id) {
      await bouncer.authorize('isAdmin')
    }

    try {
      const deleted = await Review.query().where('id', params.id).delete()

      if (deleted.includes(1)) {
        await NotificationService.onDelete('reviews', params.id)

        return response.ok(true)
      } else {
        return response.notFound()
      }
    } catch {
      return response.badRequest()
    }
  }
}
