import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SetPinnedValidator from 'App/Validators/SetPinnedValidator'
import Comment from '../../../Models/Comment'

export default class SetPinnedComment {
  async invoke({ bouncer, request, params, response }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const comment = await Comment.findOrFail(params.comment)

    const data = await request.validate(SetPinnedValidator)

    await comment.merge({
      is_pinned: data.is_pinned,
    })
    await comment.save()

    return response.status(200).send(comment)
  }
}
