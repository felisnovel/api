import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import Comment from './Comment'
import Novel from './Novel'
import Volume from './Volume'

export default class Chapter extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public number: number

  @column()
  public context: string

  @column()
  public translation_note: string

  @column()
  public is_premium: boolean

  @column()
  public is_mature: boolean

  @column()
  public view_count: number

  @column()
  public publish_status: string

  @column()
  public novel_id: number

  @column()
  public volume_id: number

  @column()
  public editor_id: number | null

  @column()
  public translator_id: number | null

  @belongsTo(() => User, {
    foreignKey: 'editor_id',
  })
  public editor: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'translator_id',
  })
  public translator: BelongsTo<typeof User>

  @belongsTo(() => Novel, {
    foreignKey: 'novel_id',
  })
  public novel: BelongsTo<typeof Novel>

  @belongsTo(() => Volume, {
    foreignKey: 'volume_id',
  })
  public volume: BelongsTo<typeof Volume>

  @manyToMany(() => User, {
    localKey: 'id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'user_id',
    pivotForeignKey: 'chapter_id',
    pivotTable: 'chapter_read',
    pivotColumns: ['created_at', 'updated_at'],
  })
  public readUsers: ManyToMany<typeof User>

  public async isRead(user: User): Promise<boolean> {
    const read = await user.related('readChapters').query().where('id', this.id).first()
    return read ? true : false
  }

  @hasMany(() => Comment, {
    foreignKey: 'chapter_id',
  })
  public comments: HasMany<typeof Comment>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
