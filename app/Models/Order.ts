import { BaseModel, beforeSave, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import OrderBuyType from '../Enums/OrderBuyType'
import OrderType from '../Enums/OrderType'
import Chapter from './Chapter'
import Packet from './Packet'
import Plan from './Plan'
import Promocode from './Promocode'
import User from './User'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public type: OrderType

  @column()
  public buy_type?: OrderBuyType | null

  @column()
  public amount?: number | null

  @column()
  public price?: number | null

  @column()
  public is_paid: boolean

  @column()
  public is_free: boolean

  @column.dateTime()
  public starts_at: DateTime

  @column.dateTime()
  public ends_at: DateTime

  @column()
  public chapter_id: number

  @belongsTo(() => Chapter, {
    foreignKey: 'chapter_id',
  })
  public chapter: BelongsTo<typeof Chapter>

  @column()
  public plan_id: number

  @belongsTo(() => Plan, {
    foreignKey: 'plan_id',
  })
  public plan: BelongsTo<typeof Plan>

  @column()
  public promocode_id: number

  @belongsTo(() => Promocode, {
    foreignKey: 'promocode_id',
  })
  public promocode: BelongsTo<typeof Promocode>

  @column()
  public packet_id: number

  @belongsTo(() => Packet, {
    foreignKey: 'packet_id',
  })
  public packet: BelongsTo<typeof Packet>

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

  @beforeSave()
  public static async syncBeforeSave(order: Order) {
    const user = await User.query().where('id', order.user_id).firstOrFail()
    await user.syncBalance(order)
  }
}
