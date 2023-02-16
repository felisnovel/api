import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import { BaseModel, column, computed } from '@ioc:Adonis/Lucid/Orm'
import AnnouncementCategory from 'App/Enums/AnnouncementCategory'
import { DateTime } from 'luxon'
import showdown from 'showdown'
import AnnouncementPublishStatus from '../Enums/AnnouncementPublishStatus'

export default class Announcement extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  @slugify({
    strategy: 'dbIncrement',
    fields: ['title'],
  })
  public slug: string

  @column()
  public publish_status: AnnouncementPublishStatus

  @column({ serializeAs: null })
  public context: string

  @computed()
  public get body() {
    const showdownService = new showdown.Converter({
      strikethrough: true,
    })
    return showdownService.makeHtml(this.context)
  }

  @column()
  public category: AnnouncementCategory

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
