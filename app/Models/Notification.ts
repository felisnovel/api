import { BaseModel, BelongsTo, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import NotificationType from '../Enums/NotificationType'
import User from './User'

export default class Notification extends BaseModel {
  public serializeExtras = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public global: boolean

  @column()
  public userId: number

  @column()
  public initiatorUserId?: number

  @column()
  public type: NotificationType

  @column()
  public notificationableType?: string

  @column()
  public notificationableId?: number

  @column()
  public body: string

  @column()
  public href?: string

  @column.dateTime()
  public readAt?: DateTime

  @column.dateTime()
  public actionedAt?: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @computed()
  public get title() {
    switch (this.type) {
      case NotificationType.ANNOUNCEMENT:
        return 'Duyuru'
      case NotificationType.REPLY:
        return 'Yanıt'
      case NotificationType.MENTION:
        return 'Bahsetme'
      case NotificationType.LIKE:
        return 'Beğeni'
      case NotificationType.FOLLOW:
        return 'Takip'
      case NotificationType.COIN:
        return 'Pati'
      case NotificationType.FREE:
        return 'Paticik'
      default:
        return 'Bildirim'
    }
  }
}
