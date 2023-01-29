import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import OrderBuyType from 'App/Enums/OrderBuyType'
import { DateTime } from 'luxon'
import OrderType from '../../app/Enums/OrderType'
import Chapter from '../../app/Models/Chapter'
import User from '../../app/Models/User'

export default class extends BaseSeeder {
  public async run() {
    const admin = await User.query().where('username', 'admin').firstOrFail()

    await admin.related('orders').create({
      type: OrderType.FREE,
      name: '250 Coin',
      amount: 250,
    })

    await admin.related('orders').create({
      type: OrderType.COIN,
      name: '100 Coin',
      price: 1,
      amount: 100,
      packet_id: 1,
      is_paid: true,
    })

    await admin.related('orders').create({
      type: OrderType.COIN,
      name: '500 Coin',
      price: 50,
      amount: 500,
      packet_id: 5,
      is_paid: true,
    })

    await admin.related('orders').create({
      type: OrderType.PLAN,
      name: 'Pro Plan',
      amount: 250,
      plan_id: 2,
      starts_at: DateTime.local(),
      ends_at: DateTime.local().plus({ days: 30 }),
    })

    const premiumChapter1 = await Chapter.query()
      .where('is_premium', true)
      .preload('novel')
      .preload('volume')
      .firstOrFail()

    const premiumChapter1JSON = premiumChapter1.serialize()

    await admin.related('orders').create({
      type: OrderType.CHAPTER,
      name: premiumChapter1JSON.fullName,
      amount: premiumChapter1.novel.coin_amount,
      buy_type: OrderBuyType.COIN,
      chapter_id: premiumChapter1.id,
      is_paid: true,
    })

    const premiumChapter2 = await Chapter.query()
      .where('is_premium', true)
      .preload('novel')
      .preload('volume')
      .firstOrFail()

    const premiumChapter2JSON = premiumChapter2.serialize()

    const order = await admin.related('orders').create({
      type: OrderType.CHAPTER,
      name: premiumChapter2JSON.fullName,
      amount: premiumChapter2.novel.free_amount,
      buy_type: OrderBuyType.FREE,
      chapter_id: premiumChapter2.id,
      is_paid: true,
    })

    await order.delete()
  }
}
