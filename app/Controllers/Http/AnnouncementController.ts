import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AnnouncementPublishStatus from 'App/Enums/AnnouncementPublishStatus'
import UserRole from 'App/Enums/UserRole'
import Announcement from 'App/Models/Announcement'
import AnnouncementRequestValidator from 'App/Validators/AnnouncementRequestValidator'
import { isNumeric } from '../../../utils'

export default class AnnouncementController {
  async index({ auth, request, response }: HttpContextContract) {
    const announcementsQuery = Announcement.query()

    if (request.input('category')) {
      announcementsQuery.where('category', request.input('category'))
    }

    const user = await auth.authenticate()

    const isAdmin = user?.role === UserRole.ADMIN

    if (!isAdmin) {
      announcementsQuery.where('publish_status', AnnouncementPublishStatus.PUBLISHED)
    } else {
      if (request.input('publish_status')) {
        announcementsQuery.where('announcements.publish_status', request.input('publish_status'))
      }
    }

    const announcements = await announcementsQuery
      .orderBy('created_at', 'desc')
      .paginate(request.input('page', 1), request.input('take', 8))

    return response.send(announcements)
  }

  async show({ auth, request, params, response }: HttpContextContract) {
    const { id } = params

    const announcementQuery = Announcement.query()
    if (isNumeric(id)) {
      announcementQuery.where('id', params.id)
    } else {
      announcementQuery.where('slug', params.id)
    }
    const announcement = await announcementQuery.firstOrFail()

    const user = await auth.authenticate()
    const isAdmin = user?.role === UserRole.ADMIN

    const announcementProps: any = {}

    if (isAdmin && request.input('md')) {
      announcementProps.context = announcement.context
    }

    return response.json({
      ...announcement.toJSON(),
      ...announcementProps,
    })
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
