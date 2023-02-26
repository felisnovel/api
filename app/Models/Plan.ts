import { BaseModel, column, computed } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Plan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public amount: number

  @column()
  public no_ads: boolean

  @column()
  public download: boolean

  @column()
  public discord_features: boolean

  @column()
  public premium_eps: boolean

  @column()
  public is_promoted: boolean

  @computed()
  public get price(): number {
    return this.amount / 10
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
