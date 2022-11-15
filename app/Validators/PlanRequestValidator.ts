import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class PlanRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }),
    amount: schema.number(),
    premium_eps: schema.boolean(),
  })
}
