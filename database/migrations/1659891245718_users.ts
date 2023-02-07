import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import UserGender from 'App/Enums/UserGender'
import UserRole from 'App/Enums/UserRole'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.string('name', 255).nullable()
      table.string('surname', 255).nullable()
      table.string('email', 255).unique().notNullable()
      table.string('username', 255).unique().notNullable()
      table.string('password', 180).notNullable()

      table.string('phone').nullable()
      table.string('address').nullable()

      table.string('discord_id').nullable()

      table.decimal('free_balance').defaultTo(0)
      table.decimal('coin_balance').defaultTo(0)

      table.string('facebook_handle').nullable()
      table.string('twitter_handle').nullable()
      table.string('instagram_handle').nullable()
      table.string('youtube_handle').nullable()

      table.boolean('marketing_emails_enabled').defaultTo(false)
      table.boolean('subscriptions_emails_enabled').defaultTo(false)
      table.boolean('comments_emails_enabled').defaultTo(false)
      table.boolean('announcements_emails_enabled').defaultTo(false)
      table.boolean('events_emails_enabled').defaultTo(false)

      table
        .enu('role', [
          UserRole.USER,
          UserRole.ADMIN,
          UserRole.EDITOR,
          UserRole.MODERATOR,
          UserRole.WRITER,
          UserRole.TRANSLATOR,
          UserRole.PUBLISHER,
        ])
        .defaultTo(UserRole.USER)

      table.string('bio', 255).nullable()

      table.enu('gender', Object.values(UserGender)).nullable()

      table.string('remember_me_token').nullable()

      table.timestamp('banned_at', { useTz: true }).nullable()
      table.timestamp('confirmed_at', { useTz: true }).nullable()

      table.integer('city_id').unsigned().nullable()
      table.foreign('city_id').references('cities.id').onDelete('RESTRICT')

      table.integer('country_id').unsigned().nullable()
      table.foreign('country_id').references('countries.id').onDelete('RESTRICT')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
