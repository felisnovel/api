import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class UpdateReviewRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    body: schema.string({ trim: true }),
  })
}
