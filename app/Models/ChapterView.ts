import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import Chapter from './Chapter'

export default class ChapterView extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public chapter_id: number

  @column()
  public ip: string

  @belongsTo(() => Chapter, {
    foreignKey: 'chapter_id',
  })
  public chapter: BelongsTo<typeof Chapter>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
