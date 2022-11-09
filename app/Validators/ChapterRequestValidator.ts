import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'

export default class ChapterRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    title: schema.string({ trim: true }),
    number: schema.number(),
    context: schema.string.optional(),
    translation_note: schema.string.optional(),
    is_mature: schema.boolean(),
    is_premium: schema.boolean(),
    publish_status: schema.enum(Object.values(ChapterPublishStatus)),
    editor: schema.string.optional(),
    translator: schema.string.optional(),
    novel_id: schema.number.optional([rules.exists({ table: 'novels', column: 'id' })]),
    volume_id: schema.number.optional([rules.exists({ table: 'volumes', column: 'id' })]),
  })
}
