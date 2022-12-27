import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import BaseValidator from './BaseValidator'

export default class PlanRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    name: schema.string({ trim: true }),
    amount: schema.number(),
    premium_eps: schema.boolean(),
    download: schema.boolean(),
    no_ads: schema.boolean(),
    discord_features: schema.boolean(),
    is_promoted: schema.boolean(),
  })
}
