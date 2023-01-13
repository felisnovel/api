import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import BaseValidator from './BaseValidator'

export default class PurchasePacketRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    name: schema.string({ trim: true }),
    phone: schema.string({ trim: true }),
    address: schema.string.optional([rules.requiredWhen('payment_type', '=', 'card')]),
    payment_type: schema.enum(['card', 'eft'] as const),
  })
}
