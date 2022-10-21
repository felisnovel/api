import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'

export default class VolumeRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string.nullableAndOptional({ trim: true }),
    volume_number: schema.number(),
    publish_status: schema.enum(Object.values(VolumePublishStatus)),
    volume_novel_id: schema.number.optional([rules.exists({ table: 'novels', column: 'id' })]),
  })
}
