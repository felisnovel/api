import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  hasMany,
  HasMany,
  HasOne,
  hasOne,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import Chapter from './Chapter'
import Review from './Review'
import Tag from './Tag'
import Volume from './Volume'

export default class Novel extends BaseModel {
  public serializeExtras = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public other_names: string | null

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

  @manyToMany(() => Tag, {
    pivotTable: 'novel_tag',
  })
  public tags: ManyToMany<typeof Tag>

  @manyToMany(() => User, {
    pivotTable: 'novel_like',
  })
  public likers: ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'novel_follow',
  })
  public followers: ManyToMany<typeof User>

  @hasMany(() => Chapter, {
    foreignKey: 'novel_id',
  })
  public chapters: HasMany<typeof Chapter>

  @hasMany(() => Review, {
    foreignKey: 'novel_id',
  })
  public reviews: HasMany<typeof Review>

  @hasMany(() => Volume, {
    foreignKey: 'volume_novel_id',
  })
  public volumes: HasMany<typeof Volume>

  @hasOne(() => Volume, {
    foreignKey: 'volume_novel_id',
    onQuery: (query) => query.orderBy('volume_number', 'desc'),
  })
  public latest_volume: HasOne<typeof Volume>

  @hasOne(() => Chapter, {
    foreignKey: 'novel_id',
    onQuery: (query) =>
      query
        .leftJoin('volumes', 'chapters.volume_id', 'volumes.id')
        .orderBy('volumes.volume_number', 'asc')
        .orderBy('chapters.number', 'asc'),
  })
  public first_chapter: HasOne<typeof Chapter>

  @hasOne(() => Chapter, {
    foreignKey: 'novel_id',
    onQuery: (query) =>
      query
        .leftJoin('volumes', 'chapters.volume_id', 'volumes.id')
        .orderBy('volumes.volume_number', 'desc')
        .orderBy('chapters.number', 'desc'),
  })
  public latest_chapter: HasOne<typeof Chapter>

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

  public async isLiked(user: User): Promise<boolean> {
    const liked = await user.related('likeNovels').query().where('id', this.id).first()
    return liked ? true : false
  }

  public async isFollowed(user: User): Promise<boolean> {
    const followed = await user.related('followNovels').query().where('id', this.id).first()
    return followed ? true : false
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
