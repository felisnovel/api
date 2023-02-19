import Database from '@ioc:Adonis/Lucid/Database'
import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  computed,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import showdown from 'showdown'
import ChapterView from './ChapterView'
import Comment from './Comment'
import Novel from './Novel'
import Order from './Order'
import Volume from './Volume'

export default class Chapter extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public number: number

  @column({ serializeAs: null })
  public context: string

  @computed()
  public get body() {
    const showdownService = new showdown.Converter({
      strikethrough: true,
    })

    return showdownService
      .makeHtml(this?.context)
      .replace(/<[^>]*>?/gm, '')
      .substring(0, 200)
  }

  @hasMany(() => ChapterView, {
    foreignKey: 'chapter_id',
  })
  public views: HasMany<typeof ChapterView>

  @column({ serializeAs: null })
  public translation_note: string

  @column()
  public is_premium: boolean

  @column()
  public is_mature: boolean

  @column()
  public publish_status: string

  @column()
  public novel_id: number

  @column()
  public volume_id: number

  @column()
  public editor: string

  @column()
  public translator: string

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
    pivotColumns: ['order_id'],
    pivotTimestamps: true,
    onQuery: (query) => {
      query.whereNullPivot('order_id')
    },
  })
  public readUsers: ManyToMany<typeof User>

  public async isPremiumRead(user: User, orderId) {
    const chapterRead = await Database.query()
      .from('chapter_read')
      .where('user_id', user.id)
      .where('chapter_id', this.id)
      .where('order_id', orderId)
      .first()

    if (chapterRead) return true

    return false
  }

  public getSlug() {
    return `novel/${this.novel.slug}/${this.novel.shorthand}-chapter-${this.number}`
  }

  public async isRead(user: null | User) {
    if (!user) return false

    const chapterRead = await Database.query()
      .from('chapter_read')
      .where('user_id', user.id)
      .where('chapter_id', this.id)
      .whereNull('order_id')
      .first()

    if (chapterRead) return true

    return false
  }

  public async isPurchased(user: null | User) {
    if (!user) return false

    const purchased = await Database.query()
      .from('orders')
      .where('user_id', user.id)
      .where('chapter_id', this.id)
      .first()

    return purchased
  }

  @computed()
  public get name(): string {
    return `${this?.novel?.name} - ${
      this?.volume?.volume_number !== 0
        ? this?.volume?.volume_number + '. Cilt'
        : this?.volume?.name
    } - Bölüm ${this.number}`
  }

  @computed()
  public get fullName(): string {
    return `${this.name}: ${this.title}`
  }

  public async checkUser(user: null | User) {
    let isSubscribed = false
    let isPurchased = false
    let subscribed: any = null
    let purchased: null | Order = null

    if (user) {
      subscribed = await user.subscribed()
      isSubscribed = subscribed?.premium_eps ?? false

      purchased = await this.isPurchased(user)
      isPurchased = purchased ? true : false
    }

    return {
      purchased,
      subscribed,
      isSubscribed,
      isPurchased,
      isOpened: isSubscribed || isPurchased || !this.is_premium,
    }
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
