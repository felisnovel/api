import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { runCommentReaction } from 'App/Services/ReactionService'
import ReactionTypeEnum from '../../../Enums/ReactionTypeEnum'
import Comment from '../../../Models/Comment'
import NotificationService from '../../../Services/NotificationService'

export default class LikeComment {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    const comment = await Comment.findOrFail(params.comment)

    await runCommentReaction({
      user,
      value: ReactionTypeEnum.LIKE,
      id: comment.id,
    })

    await NotificationService.onCommentLike(comment, user)

    return response.status(200).send({
      success: true,
    })
  }
}
