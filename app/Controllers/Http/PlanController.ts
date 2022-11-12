import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Plan from 'App/Models/Plan'
import PlanRequestValidator from 'App/Validators/PlanRequestValidator'

export default class PlanController {
  async index({ response }: HttpContextContract) {
    const plans = await Plan.query()

    return response.send(plans)
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
