import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import ContactStatus from 'App/Enums/ContactStatus'
import ContactType from 'App/Enums/ContactType'
import { DateTime } from 'luxon'
import User from './User'

export default class Contact extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string | null

  @column()
  public phone: string | null

  @column()
  public user_id: number | null

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof User>

  @column()
  public type: ContactType

  @column()
  public message: string

  @column()
  public status: ContactStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
