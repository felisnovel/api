import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  computed,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import ReactionTypeEnum from 'App/Enums/ReactionTypeEnum'
import { DateTime } from 'luxon'
import Novel from './Novel'
import ReviewReaction from './ReviewReaction'
import ReviewReport from './ReviewReport'
import User from './User'

export default class Review extends BaseModel {
  public serializeExtras = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public body: string

  @column()
  public novel_id: number

  @column()
  public is_pinned: boolean

  @column()
  public is_spoiler: boolean

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

  @hasMany(() => ReviewReaction, {
    foreignKey: 'review_id',
    onQuery: (query) => query.where('type', ReactionTypeEnum.LIKE),
  })
  public likes: HasMany<typeof ReviewReaction>

  @hasMany(() => ReviewReaction, {
    foreignKey: 'review_id',
    onQuery: (query) => query.where('type', ReactionTypeEnum.DISLIKE),
  })
  public dislikes: HasMany<typeof ReviewReaction>

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

  @hasMany(() => ReviewReport, {
    foreignKey: 'review_id',
  })
  public reports: HasMany<typeof ReviewReport>

  public async isLiked(user: User): Promise<boolean> {
    const liked = await user.related('reviewLikes').query().where('review_id', this.id).first()
    return liked ? true : false
  }

  public async isDisliked(user: User): Promise<boolean> {
    const disliked = await user
      .related('reviewDislikes')
      .query()
      .where('review_id', this.id)
      .first()
    return disliked ? true : false
  }
}
