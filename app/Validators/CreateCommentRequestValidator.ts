import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class CreateCommentRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    body: schema.string({ trim: true }),
    is_spoiler: schema.boolean.optional(),
    parent_id: schema.number.optional([rules.exists({ table: 'comments', column: 'id' })]),
    chapter_id: schema.number([rules.exists({ table: 'chapters', column: 'id' })]),
  })
}
