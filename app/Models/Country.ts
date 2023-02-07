import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import City from './City'

export default class Country extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public key: string

  @hasMany(() => City, {
    foreignKey: 'country_id',
  })
  public cities: HasMany<typeof City>
}
