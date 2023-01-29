import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SubscriptionService from 'App/Services/SubscriptionService'
import Plan from '../../../Models/Plan'

export default class SubscribePlan {
  async invoke({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const plan = await Plan.query().where('id', params.plan).firstOrFail()

    const subscribed = await user.subscribed()

    let subscription

    if (subscribed) {
      subscription = await SubscriptionService.upgradePlan(user, plan)
    } else {
      subscription = await SubscriptionService.newSubscription(user, plan)
    }

    return response.status(200).send({
      success: true,
      subscription,
    })
  }
}
