import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotificationService from 'App/Services/NotificationService'

export default class NotificationController {
  public async index({ request, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    const unreadNotifications = await NotificationService.getUnread(user.id)
    const readNotifications = await NotificationService.getLatestRead(user.id)

    if (request.input('read')) {
      await NotificationService.markAllAsRead(user.id)
    }

    return response.json({
      unreadNotifications,
      readNotifications,
    })
  }
}
