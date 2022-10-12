import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'
import User from 'App/Models/User'
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
  public editor_id: number | null

  @column()
  public translator_id: number | null

  @column()
  public status: NovelStatus

  @column()
  public publish_status: NovelPublishStatus

  @column()
  public translation_status: NovelTranslationStatus

  @belongsTo(() => User, {
    foreignKey: 'editor_id',
  })
  public editor: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'translator_id',
  })
  public translator: BelongsTo<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'novel_likers',
  })
  public likers: ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'novel_follows',
  })
  public followers: ManyToMany<typeof User>

  public async getLatestReadChapter(userId: number) {
    const chapter = await Chapter.query()
      .where('novel_id', this.id)
      .leftJoin('chapter_read', (query) => {
        query.on('chapters.id', 'chapter_read.chapter_id')
      })
      .where('chapter_read.user_id', userId)
      .orderBy('chapter_read.created_at', 'desc')
      .first()

    return chapter
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
