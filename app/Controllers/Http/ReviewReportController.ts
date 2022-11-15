import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ReviewReport from 'App/Models/ReviewReport'

export default class ReviewReportController {
  async index({ response }: HttpContextContract) {
    const reviewReports = await ReviewReport.query()
      .preload('review', (query) => {
        query.preload('user').preload('novel')
      })
      .preload('user')

    return response.send(reviewReports)
  }

  public async destroy({ response, params }: HttpContextContract) {
    try {
      const deleted = await ReviewReport.query().where('id', params.id).delete()

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
