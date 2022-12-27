import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'
import BaseValidator from './BaseValidator'

export default class VolumeRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    name: schema.string.nullableAndOptional({ trim: true }),
    volume_number: schema.number.nullableAndOptional(),
    publish_status: schema.enum(Object.values(VolumePublishStatus)),
    volume_novel_id: schema.number.optional([rules.exists({ table: 'novels', column: 'id' })]),
  })
}
