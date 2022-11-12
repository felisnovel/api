import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import OrderType from '../Enums/OrderType'

export default class AddCoinUserRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    amount: schema.number(),
    type: schema.enum(Object.values(OrderType)),
    name: schema.string(),
  })
}
