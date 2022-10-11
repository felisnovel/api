import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, beforeSave, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import UserGender from 'App/Enums/UserGender'
import UserRole from 'App/Enums/UserRole'
import gravatar from 'gravatar'
import { DateTime } from 'luxon'
import Novel from './Novel'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public full_name: string

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

  @column()
  public facebook_handle?: string

  @column()
  public twitter_handle?: string

  @column()
  public instagram_handle?: string

  @column()
  public youtube_handle?: string

  @manyToMany(() => Novel, {
    localKey: 'id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'novel_id',
    pivotForeignKey: 'user_id',
    pivotTable: 'novel_likes',
  })
  public likeNovels: ManyToMany<typeof Novel>

  @manyToMany(() => Novel, {
    localKey: 'id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'novel_id',
    pivotForeignKey: 'user_id',
    pivotTable: 'novel_follows',
  })
  public followNovels: ManyToMany<typeof Novel>

  @column.dateTime()
  public bannedAt?: DateTime

  @column.dateTime()
  public confirmedAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get avatar() {
    return gravatar.url(this.email)
  }

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
