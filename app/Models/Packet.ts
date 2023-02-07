import { BaseModel, column, computed } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Packet extends BaseModel {
  public serializeExtras = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public amount: number

  @column()
  public original_price: number

  @column()
  public discount_rate: number

  @column()
  public is_promoted: boolean

  @computed()
  public get price(): number {
    return this.original_price - (this.original_price * this.discount_rate) / 100
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
