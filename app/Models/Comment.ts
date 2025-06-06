import { BaseModel, belongsTo, BelongsTo, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import ReactionTypeEnum from 'App/Enums/ReactionTypeEnum'
import { DateTime } from 'luxon'
import Chapter from './Chapter'
import CommentReaction from './CommentReaction'
import CommentReport from './CommentReport'
import User from './User'

export default class Comment extends BaseModel {
  public serializeExtras = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public body: string

  @column()
  public is_pinned: boolean

  @column()
  public is_spoiler: boolean

  @column()
  public parent_id: number

  @belongsTo(() => Comment, {
    foreignKey: 'parent_id',
  })
  public parent: BelongsTo<typeof Comment>

  @hasMany(() => Comment, {
    foreignKey: 'parent_id',
  })
  public subComments: HasMany<typeof Comment>

  @hasMany(() => CommentReaction, {
    foreignKey: 'comment_id',
    onQuery: (query) => query.where('type', ReactionTypeEnum.LIKE),
  })
  public likes: HasMany<typeof CommentReaction>

  @hasMany(() => CommentReaction, {
    foreignKey: 'comment_id',
    onQuery: (query) => query.where('type', ReactionTypeEnum.DISLIKE),
  })
  public dislikes: HasMany<typeof CommentReaction>

  @hasMany(() => CommentReport, {
    foreignKey: 'comment_id',
  })
  public reports: HasMany<typeof CommentReport>

  @column()
  public chapter_id: number

  @belongsTo(() => Chapter, {
    foreignKey: 'chapter_id',
  })
  public chapter: BelongsTo<typeof Chapter>

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

  public async isLiked(user: User): Promise<boolean> {
    const liked = await user.related('commentLikes').query().where('comment_id', this.id).first()
    return liked ? true : false
  }

  public async isDisliked(user: User): Promise<boolean> {
    const disliked = await user
      .related('commentDislikes')
      .query()
      .where('comment_id', this.id)
      .first()
    return disliked ? true : false
  }
}
