import { BaseModel, BelongsTo, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import Novel from './Novel'
import User from './User'

export default class Review extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public body: string

  @column()
  public novel_id: number

  @column()
  public is_pinned: boolean

  @column()
  public translation_quality: number

  @column()
  public stability_of_update: number

  @column()
  public story_development: number

  @column()
  public character_design: number

  @column()
  public world_background: number

  @computed()
  public get ratings() {
    return {
      translation_quality: this.translation_quality,
      stability_of_update: this.stability_of_update,
      story_development: this.story_development,
      character_design: this.character_design,
      world_background: this.world_background,
    }
  }

  @belongsTo(() => Novel, {
    foreignKey: 'novel_id',
  })
  public novel: BelongsTo<typeof Novel>

  @column()
  public user_id: number

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
