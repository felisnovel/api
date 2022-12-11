import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { runReviewReaction } from 'App/Services/ReactionService'
import ReactionTypeEnum from '../../../Enums/ReactionTypeEnum'
import Review from '../../../Models/Review'
import NotificationService from '../../../Services/NotificationService'

export default class LikeReview {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    const review = await Review.findOrFail(params.review)

    await runReviewReaction({
      user,
      value: ReactionTypeEnum.LIKE,
      id: params.review,
    })

    await NotificationService.onReviewLike(review, user)

    return response.status(200).send({
      success: true,
    })
  }
}
