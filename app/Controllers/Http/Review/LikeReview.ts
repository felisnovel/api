import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { runReviewReaction } from 'App/Services/ReactionService'
import ReactionTypeEnum from '../../../Enums/ReactionTypeEnum'

export default class LikeReview {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    await runReviewReaction({
      user,
      value: ReactionTypeEnum.LIKE,
      id: params.review,
    })

    return response.status(200).send({
      success: true,
    })
  }
}
