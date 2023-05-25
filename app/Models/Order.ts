import { BaseModel, beforeSave, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import OrderPaymentType from 'App/Enums/OrderPaymentType'
import OrderStatus from 'App/Enums/OrderStatus'
import { DateTime } from 'luxon'
import OrderBuyType from '../Enums/OrderBuyType'
import OrderType from '../Enums/OrderType'
import Chapter from './Chapter'
import Invoice from './Invoice'
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
  public user_name: string | null

  @column()
  public user_address: string | null

  @column()
  public user_phone: string | null

  @column()
  public payment_reference: string | null

  @column()
  public payment_type: OrderPaymentType | null

  @column()
  public type: OrderType

  @column()
  public buy_type?: OrderBuyType | null

  @column()
  public amount: number

  @column()
  public price?: number | null

  @column()
  public status: OrderStatus

  @column()
  public is_free: boolean

  @column.date()
  public starts_at: DateTime

  @column.date()
  public ends_at: DateTime

  @column()
  public chapter_id: number

  @belongsTo(() => Chapter, {
    foreignKey: 'chapter_id',
  })
  public chapter: BelongsTo<typeof Chapter>

  @column()
  public invoice_id?: number

  @belongsTo(() => Invoice, {
    foreignKey: 'invoice_id',
  })
  public invoice: BelongsTo<typeof Invoice>

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

  public generateCode() {
    return this.name
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
  }

  @beforeSave()
  public static async syncBeforeSave(order: Order) {
    const user = await User.query().where('id', order.user_id).firstOrFail()
    await user.syncBalance(order)
  }
}
