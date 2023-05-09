import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import BaseValidator from './BaseValidator'

export default class UpdateReviewRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    body: schema.string({ trim: true }),
    is_spoiler: schema.boolean.optional(),
    is_recommended: schema.boolean.optional(),
  })
}
