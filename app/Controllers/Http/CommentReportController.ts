import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CommentReport from 'App/Models/CommentReport'

export default class CommentReportController {
  async index({ response }: HttpContextContract) {
    const commentReports = await CommentReport.query().preload('comment')

    return response.send(commentReports)
  }

  public async destroy({ response, params }: HttpContextContract) {
    try {
      const deleted = await CommentReport.query().where('id', params.id).delete()

      if (deleted.includes(1)) {
        return response.ok(true)
      } else {
        return response.notFound()
      }
    } catch {
      return response.badRequest()
    }
  }
}
