import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'
import { DateTime } from 'luxon'

export default class Novel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  @slugify({
    strategy: 'dbIncrement',
    fields: ['name'],
  })
  public slug: string

  @column()
  public shorthand: string

  @column()
  public image: string

  @column()
  public cover_image: string

  @column()
  public description: string

  @column()
  public author: string

  @column()
  public license_holder: string

  @column()
  public is_mature: boolean

  @column()
  public is_premium: boolean

  @column()
  public is_promoted: boolean

  @column()
  public editor_id: number

  @column()
  public translator_id: number

  @column()
  public status: NovelStatus

  @column()
  public publish_status: NovelPublishStatus

  @column()
  public translation_status: NovelTranslationStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
