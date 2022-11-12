import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import OrderBuyType from 'App/Enums/OrderBuyType'
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
    })

    await admin.related('orders').create({
      type: OrderType.COIN,
      name: '500 Coin',
      price: 50,
      amount: 500,
      packet_id: 5,
    })

    await admin.related('orders').create({
      type: OrderType.PLAN,
      name: 'Pro Plan',
      amount: 250,
      plan_id: 2,
    })

    const premiumChapter1 = await Chapter.query()
      .where('is_premium', true)
      .preload('novel')
      .firstOrFail()

    await admin.related('orders').create({
      type: OrderType.CHAPTER,
      name: premiumChapter1.title,
      amount: premiumChapter1.novel.coin_price,
      buy_type: OrderBuyType.COIN,
      chapter_id: premiumChapter1.id,
      is_paid: true,
    })

    const premiumChapter2 = await Chapter.query()
      .where('is_premium', true)
      .preload('novel')
      .firstOrFail()

    const order = await admin.related('orders').create({
      type: OrderType.CHAPTER,
      name: premiumChapter2.title,
      amount: premiumChapter2.novel.free_price,
      buy_type: OrderBuyType.FREE,
      chapter_id: premiumChapter2.id,
      is_paid: true,
    })

    await order.delete()
  }
}
