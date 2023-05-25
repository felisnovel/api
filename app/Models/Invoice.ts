import Config from '@ioc:Adonis/Core/Config'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  computed,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import { url } from 'Config/app'
import { DateTime } from 'luxon'
import Order from './Order'
import User from './User'
const kolaybiApiUrl = Config.get('kolaybi.apiUrl')

export default class Invoice extends BaseModel {
  public serializeExtras = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public document_id?: string | null

  @column()
  public e_invoice_uuid?: string | null

  @column()
  public net_total: number

  @column()
  public user_id: number | null

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof User>

  @hasMany(() => Order, {
    foreignKey: 'invoice_id',
  })
  public orders: HasMany<typeof Order>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get e_invoice_url(): string | null {
    return this.e_invoice_uuid ? `${url}/e-invoices/${this.e_invoice_uuid}` : null
  }
}
