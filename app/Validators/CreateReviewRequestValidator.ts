import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import BaseValidator from './BaseValidator'

export default class CreateReviewRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    body: schema.string({ trim: true }),
    is_spoiler: schema.boolean.optional(),
    novel_id: schema.number([rules.exists({ table: 'novels', column: 'id' })]),
    is_recommended: schema.boolean.optional(),
  })
}
