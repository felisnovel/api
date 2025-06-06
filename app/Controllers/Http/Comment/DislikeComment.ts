import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import { runCommentReaction } from 'App/Services/ReactionService'
import ReactionTypeEnum from '../../../Enums/ReactionTypeEnum'

export default class DislikeComment {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    const comment = await Comment.findOrFail(params.comment)

    await runCommentReaction({
      user,
      value: ReactionTypeEnum.DISLIKE,
      id: comment.id,
    })

    return response.status(200).send({
      success: true,
    })
  }
}
