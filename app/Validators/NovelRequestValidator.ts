import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'
import BaseValidator from './BaseValidator'

export default class NovelRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    name: schema.string(),
    other_names: schema.string.nullable(),
    shorthand: schema.string(),
    image: schema.string.optional(),
    cover_image: schema.string.optional(),
    context: schema.string(),
    author: schema.string(),
    license_holder: schema.string(),
    status: schema.enum(Object.values(NovelStatus)),
    publish_status: schema.enum(Object.values(NovelPublishStatus)),
    translation_status: schema.enum(Object.values(NovelTranslationStatus)),
    is_mature: schema.boolean(),
    is_premium: schema.boolean(),
    is_promoted: schema.boolean(),
    country_id: schema.number.optional(),
    free_amount: schema.number.optional(),
    coin_amount: schema.number.optional(),

    editor: schema.string.optional(),
    translator: schema.string.optional(),
    tags: schema.array.optional().members(schema.number()),
  })
}
