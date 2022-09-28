import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import AnnouncementCategory from 'App/Enums/AnnouncementCategory'
import { DateTime } from 'luxon'

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
  public content: string

  @column()
  public category: AnnouncementCategory

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
