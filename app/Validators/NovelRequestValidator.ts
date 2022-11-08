import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'

export default class NovelRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string(),
    other_names: schema.string.nullable(),
    shorthand: schema.string(),
    image: schema.string.optional(),
    cover_image: schema.string.optional(),
    description: schema.string(),
    author: schema.string(),
    license_holder: schema.string(),
    status: schema.enum(Object.values(NovelStatus)),
    publish_status: schema.enum(Object.values(NovelPublishStatus)),
    translation_status: schema.enum(Object.values(NovelTranslationStatus)),
    is_mature: schema.boolean(),
    is_premium: schema.boolean(),
    is_promoted: schema.boolean(),
    country_id: schema.number.optional(),
    editor_id: schema.number.optional(),
    translator_id: schema.number.optional(),
    tags: schema.array.optional().members(schema.number()),
  })
}
