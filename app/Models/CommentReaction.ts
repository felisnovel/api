import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import ReactionTypeEnum from '../Enums/ReactionTypeEnum'
import Comment from './Comment'
import User from './User'

export default class CommentReaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: ReactionTypeEnum

  @column()
  public comment_id: number

  @belongsTo(() => Comment, {
    foreignKey: 'comment_id',
  })
  public comment: BelongsTo<typeof Comment>

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
