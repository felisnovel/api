import Hash from '@ioc:Adonis/Core/Hash'
import Database from '@ioc:Adonis/Lucid/Database'
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
import OrderBuyType from 'App/Enums/OrderBuyType'
import UserGender from 'App/Enums/UserGender'
import UserRole from 'App/Enums/UserRole'
import gravatar from 'gravatar'
import { DateTime } from 'luxon'
import OrderType from '../Enums/OrderType'
import ReactionTypeEnum from '../Enums/ReactionTypeEnum'
import ApiToken from './ApiToken'
import Chapter from './Chapter'
import Comment from './Comment'
import CommentReaction from './CommentReaction'
import Notification from './Notification'
import Novel from './Novel'
import Order from './Order'
import Plan from './Plan'
import Review from './Review'
import ReviewReaction from './ReviewReaction'

export default class User extends BaseModel {
  public serializeExtras = true
  public serializeComputeds = ['socials']

  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public name?: string | null | undefined

  @column()
  public surname?: string | null | undefined

  @column()
  public address?: string | null

  @column()
  public phone?: string | null

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
  public discordId?: string

  @column()
  public youtube_handle?: string

  @column()
  public free_balance: number

  @column()
  public coin_balance: number

  @column()
  public marketing_emails_enabled: boolean

  @column()
  public subscriptions_emails_enabled: boolean

  @column()
  public comments_emails_enabled: boolean

  @column()
  public announcements_emails_enabled: boolean

  @column()
  public events_emails_enabled: boolean

  @computed()
  public get socials() {
    return {
      facebook_handle: this.facebook_handle,
      twitter_handle: this.twitter_handle,
      instagram_handle: this.instagram_handle,
      youtube_handle: this.youtube_handle,
    }
  }

  @manyToMany(() => Chapter, {
    pivotTimestamps: true,
    localKey: 'id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'chapter_id',
    pivotForeignKey: 'user_id',
    pivotTable: 'chapter_read',
    onQuery: (query) => {
      query.whereNullPivot('order_id')
    },
  })
  public readChapters: ManyToMany<typeof Chapter>

  @manyToMany(() => Chapter, {
    pivotTimestamps: true,
    localKey: 'id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'chapter_id',
    pivotForeignKey: 'user_id',
    pivotTable: 'chapter_read',
    onQuery: (query) => {
      query.whereNotNullPivot('order_id')
    },
  })
  public premiumReadChapters: ManyToMany<typeof Chapter>

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

  @hasMany(() => Notification, {
    foreignKey: 'userId',
  })
  public notifications: HasMany<typeof Notification>

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

  @hasMany(() => Order, {
    foreignKey: 'user_id',
  })
  public orders: HasMany<typeof Order>

  @manyToMany(() => Chapter, {
    pivotTimestamps: true,
    localKey: 'id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'chapter_id',
    pivotForeignKey: 'user_id',
    pivotTable: 'orders',
  })
  public purchasedChapters: ManyToMany<typeof Chapter>

  @manyToMany(() => Plan, {
    pivotTimestamps: true,
    localKey: 'id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'plan_id',
    pivotForeignKey: 'user_id',
    pivotTable: 'orders',
    pivotColumns: ['ends_at'],
    onQuery: (query) => {
      query
        .where('type', OrderType.PLAN)
        .where('ends_at', '>=', DateTime.now().toSQL())
        .where('starts_at', '<=', DateTime.now().toSQL())
    },
  })
  public subscribedPlans: ManyToMany<typeof Plan>

  public async subscribed() {
    return await Database.query()
      .from('orders')
      .where('user_id', this.id)
      .where('type', OrderType.PLAN)
      .where('is_paid', true)
      .where('ends_at', '>=', DateTime.now().toSQL())
      .where('starts_at', '<=', DateTime.now().toSQL())
      .leftJoin('plans', 'orders.plan_id', 'plans.id')
      .select(
        'orders.id as order_id',
        'orders.*',
        'plans.no_ads',
        'plans.premium_eps',
        'plans.download',
        'plans.discord_features',
        'plans.is_promoted',
        'plans.amount as plan_amount'
      )
      .orderBy('orders.id', 'desc')
      .first()
  }

  public isPremiumEpsSubscribedOf(subscribed) {
    return subscribed?.premium_eps ?? false
  }

  public buyableOf(amount = 0, type = OrderBuyType.COIN) {
    if (type === OrderBuyType.COIN && Number(amount) > this.coin_balance) {
      return false
    }

    if (type === OrderBuyType.FREE && Number(amount) > this.free_balance) {
      return false
    }

    return true
  }

  @hasMany(() => ApiToken, {
    foreignKey: 'userId',
  })
  public tokens: HasMany<typeof ApiToken>

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
  public mutedAt?: DateTime

  @column.dateTime()
  public bannedAt?: DateTime

  @column.dateTime()
  public confirmedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get avatar() {
    return gravatar.url(this.email)
  }

  public async syncBalance(order: Order | null = null) {
    let freeBalance = 0
    let coinBalance = 0

    if (order) {
      const amount = Number(order.amount)

      if (amount) {
        if (order.is_paid === true) {
          if (order.type === OrderType.FREE) {
            freeBalance += amount
          } else if (order.type === OrderType.COIN) {
            coinBalance += amount
          } else if (order.type === OrderType.PLAN) {
            coinBalance -= amount
          } else if (order.buy_type === OrderBuyType.COIN) {
            coinBalance -= amount
          } else if (order.buy_type === OrderBuyType.FREE) {
            freeBalance -= amount
          }
        }
      }
    }

    const freeBalanceQuery = Database.query().from('orders')
    if (order?.id) {
      freeBalanceQuery.whereNot('id', order.id)
    }
    const freeBalanceOrders = await freeBalanceQuery
      .where('user_id', this.id)
      .where('type', OrderType.FREE)
      .where('is_paid', true)
      .sum('amount')

    const coinBalanceQuery = Database.query().from('orders')
    if (order?.id) {
      coinBalanceQuery.whereNot('id', order.id)
    }
    const coinBalanceOrders = await coinBalanceQuery
      .where('user_id', this.id)
      .where('type', OrderType.COIN)
      .where('is_paid', true)
      .sum('amount')

    const freeChapterQuery = Database.query().from('orders')
    if (order?.id) {
      freeChapterQuery.whereNot('id', order.id)
    }
    const freeChapterOrders = await freeChapterQuery
      .where('buy_type', OrderBuyType.FREE)
      .where('user_id', this.id)
      .where('type', OrderType.CHAPTER)
      .where('is_paid', true)
      .sum('amount')

    const coinChapterQuery = Database.query().from('orders')
    if (order?.id) {
      coinChapterQuery.whereNot('id', order.id)
    }
    const coinChapterOrders = await coinChapterQuery
      .where('buy_type', OrderBuyType.COIN)
      .where('user_id', this.id)
      .where('type', OrderType.CHAPTER)
      .where('is_paid', true)
      .sum('amount')

    const planQuery = Database.query().from('orders')
    if (order?.id) {
      planQuery.whereNot('id', order.id)
    }
    const planOrders = await planQuery
      .where('user_id', this.id)
      .where('type', OrderType.PLAN)
      .where('is_paid', true)
      .sum('amount')

    freeBalance += (freeBalanceOrders[0].sum ?? 0) - (freeChapterOrders[0].sum ?? 0)
    coinBalance +=
      (coinBalanceOrders[0].sum ?? 0) - (coinChapterOrders[0].sum ?? 0) - (planOrders[0].sum ?? 0)

    await Database.query().from('users').where('id', this.id).update({
      free_balance: freeBalance,
      coin_balance: coinBalance,
    })
  }

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
