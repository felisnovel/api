import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Review from 'App/Models/Review'
import { runReviewReaction } from 'App/Services/ReactionService'
import ReactionTypeEnum from '../../../Enums/ReactionTypeEnum'

export default class DislikeReview {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    const review = await Review.findOrFail(params.review)

    await runReviewReaction({
      user,
      value: ReactionTypeEnum.DISLIKE,
      id: review.id,
    })

    return response.status(200).send({
      success: true,
    })
  }
}
