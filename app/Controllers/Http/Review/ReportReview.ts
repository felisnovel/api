import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ReportValidator from 'App/Validators/ReportRequestValidator'
import Review from '../../../Models/Review'

export default class ReportReview {
  async invoke({ auth, request, params, response }: HttpContextContract) {
    const user = await auth.authenticate()

    const review = await Review.findOrFail(params.review)

    const data = await request.validate(ReportValidator)

    await review.merge({
      ...data,
      user_id: user.id,
    })
    await review.save()

    return response.status(200).send(review)
  }
}
