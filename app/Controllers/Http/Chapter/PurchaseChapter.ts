import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OrderBuyType from 'App/Enums/OrderBuyType'
import { DateTime } from 'luxon'
import OrderType from '../../../Enums/OrderType'
import Chapter from '../../../Models/Chapter'

export default class PurchaseChapter {
  async invoke({ request, params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const chapter = await Chapter.query()
      .preload('novel')
      .preload('volume')
      .where('id', params.chapter)
      .firstOrFail()

    const isPurchased = await chapter.isPurchased(user)

    if (isPurchased) {
      return response.status(400).send({
        success: false,
        message: 'You have already purchased this chapter.',
      })
    }

    const chapterJSON = chapter.serialize()

    if (!chapter.is_premium) {
      return response.badRequest({
        message: 'This chapter is free',
      })
    }

    const buyType = request.input('buy_type', OrderBuyType.COIN)

    let amount

    if (buyType === OrderBuyType.FREE) {
      amount = chapter.novel.free_amount
    } else {
      amount = chapter.novel.coin_amount
    }

    if (!user.buyableOf(amount, buyType)) {
      return response.badRequest({
        message: 'Yetersiz bakiye!',
      })
    }

    await user.related('orders').create({
      type: OrderType.CHAPTER,
      name: chapterJSON.fullName,
      amount,
      is_paid: true,
      chapter_id: chapter.id,
      buy_type: buyType,
      starts_at: DateTime.local(),
    })

    return response.status(200).send({
      success: true,
    })
  }
}
