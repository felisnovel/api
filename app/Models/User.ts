import { DateTime } from 'luxon'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'

import Hash from '@ioc:Adonis/Core/Hash'
import UserRole from 'App/Enums/UserRole'
import UserGender from 'App/Enums/UserGender'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public username: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public role: UserRole

  @column()
  public bio?: string

  @column()
  public gender?: UserGender

  @column()
  public rememberMeToken?: string

  @column.dateTime()
  public bannedAt?: DateTime

  @column.dateTime()
  public confirmedAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
