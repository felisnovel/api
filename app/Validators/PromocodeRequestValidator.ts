import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class PromocodeRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }),
    code: schema.string({ trim: true }),
    active: schema.boolean(),
    limit: schema.number(),
    amount: schema.number(),
  })
}
