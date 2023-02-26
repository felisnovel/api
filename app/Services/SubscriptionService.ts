import Database from '@ioc:Adonis/Lucid/Database'
import OrderBuyType from 'App/Enums/OrderBuyType'
import OrderStatus from 'App/Enums/OrderStatus'
import OrderType from 'App/Enums/OrderType'
import Order from 'App/Models/Order'
import Plan from 'App/Models/Plan'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import OrderService from './OrderService'

const orderBuyTypeToPlanAmountKey = {
  try: 'price',
  coin: 'amount',
}

export function usePreviewEndSubscription(subscription) {
  const now = DateTime.local()

  const startsAt = DateTime.fromJSDate(subscription.starts_at).startOf('day')
  const endsAt = DateTime.fromJSDate(subscription.ends_at).startOf('day')

  const dayAmount = subscription.amount / endsAt.diff(startsAt, ['days']).days
  const usedDays = now.startOf('day').diff(startsAt, ['days']).days
  const usedAmount = dayAmount * usedDays
  let remainingAmount = subscription.amount - usedAmount

  if (subscription.buy_type === OrderBuyType.TRY) {
    remainingAmount *= 10
  }

  return { usedAmount, startsAt, endsAt, now, remainingAmount }
}

export function usePreviewNewSubscription(startsAt, endsAt, plan) {
  const startsAStartOfDay = startsAt.startOf('day')
  const endsAtStartOfDay = endsAt.startOf('day')
  const days = endsAtStartOfDay.diff(startsAStartOfDay, ['days']).days

  const dayAmount = plan.amount / 30
  const amount = dayAmount * days

  const dayPrice = plan.price / 30
  const price = dayPrice * days

  return { amount, price }
}

export function usePreviewUpgradeSubscription(endSubscription, upgradePlan) {
  const { endsAt, now, remainingAmount } = usePreviewEndSubscription(endSubscription)
  const { amount } = usePreviewNewSubscription(now, endsAt, upgradePlan)

  return { amount: amount - remainingAmount }
}

export default class SubscriptionService {
  public static async newSubscription(
    user: User,
    plan: Plan,
    startsAt?: DateTime,
    endsAt?: DateTime
  ): Promise<any> {
    const subscribed = await user.subscribed()

    if (subscribed) {
      throw new Error('Hali hazırda bir planınız bulunmaktadır.')
    }

    const _startsAt = startsAt || DateTime.local()

    return await this.subscribePlan(user, plan, _startsAt, endsAt || _startsAt.plus({ days: 30 }))
  }

  public static async upgradePlan(user: User, plan: Plan): Promise<any> {
    const subscription = await user.subscribed()

    if (!subscription) {
      throw new Error('Yükseltme başarısız!')
    }

    if (!subscription.buy_type) {
      throw new Error('Ödeme tipi geçersiz!')
    }

    const planAmountKey = orderBuyTypeToPlanAmountKey[subscription.buy_type]
    const subscriptionPlanAmount = subscription[`plan_${planAmountKey}`]
    const planAmount = plan[planAmountKey]

    if (Number(subscriptionPlanAmount) >= Number(planAmount)) {
      throw new Error('Sadece üst planlara yükselme yapabilirsiniz.')
    }

    if (subscription.plan_id === plan.id) {
      throw new Error('Bu plana zaten abonesiniz.')
    }

    const { now, endsAt, usedAmount } = usePreviewEndSubscription(subscription)

    return await Database.transaction(async () => {
      await Order.query().where('id', subscription.id).update({
        ends_at: now,
      })

      if (subscription.buy_type === OrderBuyType.COIN) {
        await Order.query().where('id', subscription.id).update({
          amount: usedAmount,
        })
      }

      await user.refresh()

      const newOrder = await this.subscribePlan(user, plan, now, endsAt)
      await Order.query().where('id', newOrder.id).update({
        buy_type: OrderBuyType.COIN,
      })
      await OrderService.updateStatus(newOrder, OrderStatus.PAID)
    })
  }

  public static async subscribePlan(
    user: User,
    plan: Plan,
    startsAt: DateTime,
    endsAt: DateTime
  ): Promise<any> {
    const { amount, price } = usePreviewNewSubscription(startsAt, endsAt, plan)

    const subscription = await user.related('orders').create({
      type: OrderType.PLAN,
      name: plan.name,
      amount,
      price,
      plan_id: plan.id,
      starts_at: startsAt,
      ends_at: endsAt,
    })

    return subscription
  }
}
