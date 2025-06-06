import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import AnnouncementCategory from 'App/Enums/AnnouncementCategory'
import AnnouncementPublishStatus from '../Enums/AnnouncementPublishStatus'
import BaseValidator from './BaseValidator'

export default class AnnouncementRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    title: schema.string({ trim: true }),
    context: schema.string({ trim: true }),
    category: schema.enum(Object.values(AnnouncementCategory)),
    publish_status: schema.enum(Object.values(AnnouncementPublishStatus)),
  })

  public messages = {}
}
