import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import OrderPaymentType from 'App/Enums/OrderPaymentType'
import BaseValidator from './BaseValidator'

export default class PurchasePacketRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    payment_type: schema.enum(Object.values(OrderPaymentType)),
  })
}
