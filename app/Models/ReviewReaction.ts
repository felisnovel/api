import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import ReactionTypeEnum from '../Enums/ReactionTypeEnum'
import Review from './Review'
import User from './User'

export default class ReviewReaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: ReactionTypeEnum

  @column()
  public review_id: number

  @belongsTo(() => Review, {
    foreignKey: 'review_id',
  })
  public review: BelongsTo<typeof Review>

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
