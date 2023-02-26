import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Plan from 'App/Models/Plan'
import { usePreviewUpgradeSubscription } from 'App/Services/SubscriptionService'
import PlanRequestValidator from 'App/Validators/PlanRequestValidator'

export default class PlanController {
  async index({ response, auth }: HttpContextContract) {
    const plans = await Plan.query().orderBy('id', 'desc')

    const user = await auth.authenticate()

    let plansJSON: any = plans

    if (user) {
      const subscribed = await user.subscribed()

      plansJSON = await Promise.all(
        plansJSON.map(async (plan) => {
          if (subscribed) {
            const { amount } = usePreviewUpgradeSubscription(subscribed, plan)

            return {
              ...plan.toJSON(),
              remaining_amount: amount,
            }
          } else {
            return plan
          }
        })
      )
    }

    return response.send(plansJSON)
  }

  async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(PlanRequestValidator)

    const plan = await Plan.create(data)

    return response.json(plan)
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(PlanRequestValidator)

    const plan = await Plan.findOrFail(params.id)

    await plan.merge(data)
    await plan.save()

    return response.json(plan)
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    try {
      const deleted = await Plan.query().where('id', params.id).delete()

      if (deleted.includes(1)) {
        return response.ok(true)
      } else {
        return response.notFound()
      }
    } catch {
      return response.badRequest()
    }
  }
}
