import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class CreateReviewRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    body: schema.string({ trim: true }),
    novel_id: schema.number([rules.exists({ table: 'novels', column: 'id' })]),
  })
}
