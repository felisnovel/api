import Hash from '@ioc:Adonis/Core/Hash'
import {
  BaseModel,
  beforeSave,
  column,
  computed,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import UserGender from 'App/Enums/UserGender'
import UserRole from 'App/Enums/UserRole'
import gravatar from 'gravatar'
import { DateTime } from 'luxon'
import ReactionTypeEnum from '../Enums/ReactionTypeEnum'
import Chapter from './Chapter'
import Comment from './Comment'
import CommentReaction from './CommentReaction'
import Novel from './Novel'
import Review from './Review'
import ReviewReaction from './ReviewReaction'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public full_name?: string | null | undefined

  @column()
  public username: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public role: UserRole

  @column()
  public bio?: string | null | undefined

  @column()
  public gender?: UserGender | null | undefined

  @column()
  public rememberMeToken?: string

  @column()
  public facebook_handle?: string

  @column()
  public twitter_handle?: string

  @column()
  public instagram_handle?: string

  @column()
  public youtube_handle?: string

  @manyToMany(() => Chapter, {
    localKey: 'id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'chapter_id',
    pivotForeignKey: 'user_id',
    pivotTable: 'chapter_read',
  })
  public readChapters: ManyToMany<typeof Chapter>

  @manyToMany(() => Novel, {
    localKey: 'id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'novel_id',
    pivotForeignKey: 'user_id',
    pivotTable: 'novel_like',
  })
  public likeNovels: ManyToMany<typeof Novel>

  @manyToMany(() => Novel, {
    localKey: 'id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'novel_id',
    pivotForeignKey: 'user_id',
    pivotTable: 'novel_follow',
  })
  public followNovels: ManyToMany<typeof Novel>

  @manyToMany(() => Novel, {
    localKey: 'id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'novel_id',
    pivotForeignKey: 'user_id',
    pivotTable: 'user_favorite',
    pivotColumns: ['order'],
  })
  public favorites: ManyToMany<typeof Novel>

  @hasMany(() => Comment, {
    foreignKey: 'user_id',
  })
  public comments: HasMany<typeof Comment>

  @hasMany(() => ReviewReaction, {
    foreignKey: 'user_id',
  })
  public reviewReactions: HasMany<typeof ReviewReaction>

  @hasMany(() => CommentReaction, {
    foreignKey: 'user_id',
  })
  public commentReactions: HasMany<typeof CommentReaction>

  @hasMany(() => ReviewReaction, {
    foreignKey: 'user_id',
    onQuery: (query) => {
      query.where('type', ReactionTypeEnum.LIKE)
    },
  })
  public reviewLikes: HasMany<typeof ReviewReaction>

  @hasMany(() => ReviewReaction, {
    foreignKey: 'user_id',
    onQuery: (query) => {
      query.where('type', ReactionTypeEnum.DISLIKE)
    },
  })
  public reviewDislikes: HasMany<typeof ReviewReaction>

  @hasMany(() => CommentReaction, {
    foreignKey: 'user_id',
    onQuery: (query) => {
      query.where('type', ReactionTypeEnum.LIKE)
    },
  })
  public commentLikes: HasMany<typeof CommentReaction>

  @hasMany(() => CommentReaction, {
    foreignKey: 'user_id',
    onQuery: (query) => {
      query.where('type', ReactionTypeEnum.DISLIKE)
    },
  })
  public commentDislikes: HasMany<typeof CommentReaction>

  @hasMany(() => Review, {
    foreignKey: 'user_id',
  })
  public reviews: HasMany<typeof Review>

  @column.dateTime()
  public bannedAt?: DateTime

  @column.dateTime()
  public confirmedAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get avatar() {
    return gravatar.url(this.email)
  }

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
