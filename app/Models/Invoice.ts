import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Invoice extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public document_id?: string | null

  @column()
  public netTotal: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
