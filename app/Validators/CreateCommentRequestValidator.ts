import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import BaseValidator from './BaseValidator'

export default class CreateCommentRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    body: schema.string({ trim: true }),
    is_spoiler: schema.boolean.optional(),
    parent_id: schema.number.optional([rules.exists({ table: 'comments', column: 'id' })]),
    chapter_id: schema.number([rules.exists({ table: 'chapters', column: 'id' })]),
  })
}
