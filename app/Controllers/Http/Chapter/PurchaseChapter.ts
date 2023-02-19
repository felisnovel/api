import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OrderBuyType from 'App/Enums/OrderBuyType'
import OrderStatus from 'App/Enums/OrderStatus'
import { DateTime } from 'luxon'
import OrderType from '../../../Enums/OrderType'
import Chapter from '../../../Models/Chapter'
import ChapterService from '../../../Services/ChapterService'

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
        message: 'Bu bölümü zaten satın aldınız.',
      })
    }

    const chapterJSON = chapter.serialize()

    if (!chapter.is_premium) {
      return response.badRequest({
        message: 'Bu bölüm zaten ücretsiz.',
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

    if (buyType === OrderBuyType.FREE) {
      const isAvailableFreeBuyableChapter = await ChapterService.isAvailableFreeBuyableOfChapter(
        chapter,
        user
      )

      if (!isAvailableFreeBuyableChapter) {
        return response.badRequest({
          message:
            'Paticik kullanarak sadece sırayla bölüm açabilirsiniz. Lütfen açmadığınız ilk bölümden açmaya başlayınız.',
        })
      }
    }

    await user.related('orders').create({
      type: OrderType.CHAPTER,
      name: chapterJSON.fullName,
      amount,
      status: OrderStatus.PAID,
      chapter_id: chapter.id,
      buy_type: buyType,
      starts_at: DateTime.local(),
    })

    return response.status(200).send({
      success: true,
    })
  }
}
