import Database from '@ioc:Adonis/Lucid/Database'
import OrderStatus from 'App/Enums/OrderStatus'
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
  ): Promise<any> {
    const subscribed = await user.subscribed()

    if (subscribed) {
      throw new Error('Hali hazırda bir planınız bulunmaktadır. ')
    }

    const _startsAt = startsAt || DateTime.local()

    return await this.subscribePlan(user, plan, _startsAt, endsAt || _startsAt.plus({ days: 30 }))
  }

  public static async upgradePlan(user: User, plan: Plan, isPreview = false): Promise<any> {
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
    const usedAmount = dayAmount * usedDays

    return await Database.transaction(async () => {
      if (isPreview) {
        const newPlan = await this.subscribePlan(user, plan, now, endsAt, true)

        return {
          activePlan: {
            prevAmount: subscribed.amount,
            newAmount: usedAmount,
          },
          newPlan,
        }
      }

      await Order.query().where('id', subscribed.id).update({
        ends_at: now,
        amount: usedAmount,
      })

      await user.refresh()

      return await this.subscribePlan(user, plan, now, endsAt)
    })
  }

  public static async subscribePlan(
    user: User,
    plan: Plan,
    startsAt: DateTime,
    endsAt: DateTime,
    isPreview = false
  ): Promise<any> {
    if (!user.buyableOf(plan.amount)) {
      throw new Error('Yetersiz bakiye!')
    }

    const startsAStartOfDay = startsAt.startOf('day')
    const endsAtStartOfDay = endsAt.startOf('day')
    const dayPrice = plan.amount / 30
    const amount = dayPrice * endsAtStartOfDay.diff(startsAStartOfDay, ['days']).days

    if (isPreview) {
      return {
        prevAmount: plan.amount,
        newAmount: amount,
      }
    }

    const subscription = await user.related('orders').create({
      type: OrderType.PLAN,
      name: plan.name,
      amount,
      status: OrderStatus.PAID,
      plan_id: plan.id,
      starts_at: startsAt,
      ends_at: endsAt,
    })

    return subscription
  }
}
