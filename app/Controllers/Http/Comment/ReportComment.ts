import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ReportValidator from 'App/Validators/ReportRequestValidator'
import Comment from '../../../Models/Comment'

export default class ReportComment {
  async invoke({ auth, request, params, response }: HttpContextContract) {
    const user = await auth.authenticate()

    const comment = await Comment.findOrFail(params.comment)

    const data = await request.validate(ReportValidator)

    const commentReport = await comment.related('reports').create({
      user_id: user.id,
      ...data,
    })

    return response.status(200).send(commentReport)
  }
}
