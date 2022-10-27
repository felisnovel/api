import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SetPinnedValidator from 'App/Validators/SetPinnedValidator'
import Review from '../../../Models/Review'

export default class SetPinnedReview {
  async invoke({ bouncer, request, params, response }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const review = await Review.findOrFail(params.review)

    const data = await request.validate(SetPinnedValidator)

    await review.merge({
      is_pinned: data.is_pinned,
    })
    await review.save()

    return response.status(200).send(review)
  }
}
