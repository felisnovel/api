import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Announcement from 'App/Models/Announcement'
import AnnouncementRequestValidator from 'App/Validators/AnnouncementRequestValidator'
import { isNumeric } from '../../../utils'

export default class AnnouncementController {
  async index({ response }: HttpContextContract) {
    const announcements = await Announcement.query().limit(4).orderBy('created_at', 'desc')

    return response.send(announcements)
  }

  async show({ params, response }: HttpContextContract) {
    const { id } = params

    let announcement: Announcement
    if (isNumeric(id)) {
      announcement = await Announcement.query().where('id', params.id).firstOrFail()
    } else {
      announcement = await Announcement.query().where('slug', params.id).firstOrFail()
    }

    return response.json(announcement)
  }

  async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(AnnouncementRequestValidator)

    const announcement = await Announcement.create(data)

    return response.json(announcement)
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(AnnouncementRequestValidator)

    const announcement = await Announcement.findOrFail(params.id)

    await announcement.merge(data)
    await announcement.save()

    return response.json(announcement)
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    try {
      const deleted = await Announcement.query().where('id', params.id).delete()

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
