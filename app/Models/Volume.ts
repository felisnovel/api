import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Novel from 'App/Models/Novel'
import { DateTime } from 'luxon'

export default class Volume extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string | null | undefined

  @column()
  public number: number

  @column()
  public novel_id: number

  @column()
  public publish_status: string

  @belongsTo(() => Novel, {
    foreignKey: 'novel_id',
  })
  public novel: BelongsTo<typeof Novel>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
