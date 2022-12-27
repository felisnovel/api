import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import OrderType from '../Enums/OrderType'
import BaseValidator from './BaseValidator'

export default class AddCoinUserRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    amount: schema.number(),
    type: schema.enum(Object.values(OrderType)),
    name: schema.string(),
  })
}
