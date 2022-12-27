import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import BaseValidator from './BaseValidator'

export default class UserFavoriteRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    order: schema.number([rules.range(1, 5)]),
    novel_id: schema.number([rules.exists({ table: 'novels', column: 'id' })]),
  })
}
