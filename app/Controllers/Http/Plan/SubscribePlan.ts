import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'
import OrderType from '../../../Enums/OrderType'
import Plan from '../../../Models/Plan'

export default class SubscribePlan {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const plan = await Plan.query().where('id', params.plan).firstOrFail()

    const isSubscribed = await user.isSubscribed()

    if (isSubscribed) {
      return response.badRequest({
        message: 'This plan is subscribed',
      })
    }

    if (!user.buyableOf(plan.amount)) {
      return response.badRequest({
        message: 'Yetersiz bakiye!',
      })
    }

    await user.related('orders').create({
      type: OrderType.PLAN,
      name: plan.name,
      amount: plan.amount,
      is_paid: true,
      plan_id: plan.id,
      starts_at: DateTime.local(),
      ends_at: DateTime.local().plus({ months: 1 }),
    })

    return response.status(200).send({
      success: true,
    })
  }
}
