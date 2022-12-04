import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Chapter from '../../../Models/Chapter'

export default class ReadChapter {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const chapter = await Chapter.findOrFail(params.chapter)

    const isPremium = chapter.is_premium

    if (isPremium) {
      const { isOpened, purchased, subscribed } = await chapter.checkUser(user)

      if (!isOpened) {
        return response.badRequest('Error!')
      }

      const orderId = purchased?.id || subscribed?.order_id

      const isPremiumRead = await chapter.isPremiumRead(user, orderId)

      if (!isPremiumRead) {
        await user.related('premiumReadChapters').attach({
          [chapter.id]: {
            order_id: orderId,
          },
        })
      }
    }

    const isRead = await chapter.isRead(user)

    if (!isRead) {
      await user.related('readChapters').attach([chapter.id])
    }

    return response.status(200).send({
      success: true,
    })
  }
}
