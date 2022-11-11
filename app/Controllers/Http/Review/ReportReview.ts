import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ReportValidator from 'App/Validators/ReportRequestValidator'
import Review from '../../../Models/Review'

export default class ReportReview {
  async invoke({ auth, request, params, response }: HttpContextContract) {
    const user = await auth.authenticate()

    const review = await Review.findOrFail(params.review)

    const data = await request.validate(ReportValidator)

    const reviewReport = await review.related('reports').create({
      user_id: user.id,
      ...data,
    })

    return response.status(200).send(reviewReport)
  }
}
