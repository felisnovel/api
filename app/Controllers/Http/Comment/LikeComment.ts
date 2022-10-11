import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { runCommentReaction } from 'App/Services/ReactionService'
import ReactionTypeEnum from '../../../Enums/ReactionTypeEnum'

export default class LikeComment {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    await runCommentReaction({
      user,
      value: ReactionTypeEnum.LIKE,
      id: params.comment,
    })

    return response.status(200).send({
      success: true,
    })
  }
}
