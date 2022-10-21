import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class UserFavoriteRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    order: schema.number([rules.range(1, 5)]),
    novel_id: schema.number([rules.exists({ table: 'novels', column: 'id' })]),
  })
}
