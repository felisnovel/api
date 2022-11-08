import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import AnnouncementCategory from 'App/Enums/AnnouncementCategory'
import AnnouncementPublishStatus from '../Enums/AnnouncementPublishStatus'

export default class AnnouncementRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    title: schema.string({ trim: true }),
    content: schema.string({ trim: true }),
    category: schema.enum(Object.values(AnnouncementCategory)),
    publish_status: schema.enum(Object.values(AnnouncementPublishStatus)),
  })

  public messages = {}
}
