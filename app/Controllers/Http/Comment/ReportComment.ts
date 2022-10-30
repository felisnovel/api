import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ReportValidator from 'App/Validators/ReportRequestValidator'
import Comment from '../../../Models/Comment'

export default class ReportComment {
  async invoke({ auth, request, params, response }: HttpContextContract) {
    const user = await auth.authenticate()

    const comment = await Comment.findOrFail(params.comment)

    const data = await request.validate(ReportValidator)

    await comment.merge({
      ...data,
      user_id: user.id,
    })
    await comment.save()

    return response.status(200).send(comment)
  }
}
