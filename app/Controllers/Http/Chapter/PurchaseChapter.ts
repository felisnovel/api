import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OrderBuyType from 'App/Enums/OrderBuyType'
import OrderType from '../../../Enums/OrderType'
import Chapter from '../../../Models/Chapter'

export default class PurchaseChapter {
  async invoke({ request, params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const chapter = await Chapter.findOrFail(params.chapter)
    await chapter.load('novel')
    await chapter.load('volume')

    if (!chapter.is_premium) {
      return response.badRequest({
        message: 'This chapter is free',
      })
    }

    let amount
    if (request.input('buy_type') === OrderBuyType.FREE) {
      amount = chapter.novel.free_amount
    } else {
      amount = chapter.novel.coin_amount
    }

    const purchaseChapter = await user
      .related('purchasedChapters')
      .query()
      .where('chapter_id', chapter.id)
      .first()

    if (!purchaseChapter) {
      await user.related('orders').create({
        type: OrderType.CHAPTER,
        name:
          chapter.novel.name + ' - ' + chapter.volume.volume_number + '. Cilt - ' + chapter.title,
        amount,
        is_paid: true,
        chapter_id: chapter.id,
      })
    }

    return response.status(200).send({
      success: true,
    })
  }
}
