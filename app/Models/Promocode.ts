import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import Order from './Order'

export default class Promocode extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public code: string

  @column()
  public active: boolean

  @column()
  public used: number

  @column()
  public amount: number

  @column()
  public limit: number

  @hasMany(() => Order, {
    foreignKey: 'promocode_id',
  })
  public orders: HasMany<typeof Order>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
