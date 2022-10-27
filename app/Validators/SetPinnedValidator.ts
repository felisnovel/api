import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class SetPinnedValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    is_pinned: schema.boolean(),
  })
}
