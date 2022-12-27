import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import BaseValidator from './BaseValidator'

export default class PacketRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    name: schema.string({ trim: true }),
    price: schema.number(),
    amount: schema.number(),
    is_promoted: schema.boolean(),
  })
}
