import OrderType from 'App/Enums/OrderType'
import Order from 'App/Models/Order'
import Plan from 'App/Models/Plan'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class SubscriptionService {
  public static async newSubscription(
    user: User,
    plan: Plan,
    startsAt?: DateTime,
    endsAt?: DateTime
  ) {
    const subscribed = await user.subscribed()

    if (subscribed) {
      throw new Error('Hali hazırda bir planınız bulunmaktadır. ')
    }

    const _startsAt = startsAt || DateTime.local()

    return this.subscribePlan(user, plan, _startsAt, endsAt || _startsAt.plus({ days: 30 }))
  }

  public static async upgradePlan(user: User, plan: Plan) {
    const subscribed = await user.subscribed()

    if (!subscribed) {
      throw new Error('Herhangi bir plana abone değilsiniz.')
    }

    if (Number(subscribed.plan_amount) >= Number(plan.amount)) {
      throw new Error('Sadece üst planlara yükselme yapabilirsiniz.')
    }

    if (subscribed.plan_id === plan.id) {
      throw new Error('Bu plana zaten abonesiniz.')
    }

    const now = DateTime.local()

    const startsAt = DateTime.fromJSDate(subscribed.starts_at).startOf('day')
    const endsAt = DateTime.fromJSDate(subscribed.ends_at).startOf('day')

    const dayAmount = subscribed.amount / endsAt.diff(startsAt, ['days']).days
    const usedDays = now.startOf('day').diff(startsAt, ['days']).days
    const usedPrice = dayAmount * usedDays

    await Order.query().where('id', subscribed.id).update({
      ends_at: now,
      amount: usedPrice,
    })

    return this.subscribePlan(user, plan, now, endsAt)
  }

  public static async subscribePlan(user: User, plan: Plan, startsAt: DateTime, endsAt: DateTime) {
    if (!user.buyableOf(plan.amount)) {
      throw new Error('Yetersiz bakiye!')
    }

    const startsAStartOfDay = startsAt.startOf('day')
    const endsAtStartOfDay = endsAt.startOf('day')
    const dayPrice = plan.amount / 30
    const amount = dayPrice * endsAtStartOfDay.diff(startsAStartOfDay, ['days']).days

    const subscription = await user.related('orders').create({
      type: OrderType.PLAN,
      name: plan.name,
      amount,
      is_paid: true,
      plan_id: plan.id,
      starts_at: startsAt,
      ends_at: endsAt,
    })

    return subscription
  }
}
