import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import UserRole from 'App/Enums/UserRole'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email', 255).unique().notNullable()
      table.string('username', 255).unique().notNullable()
      table.string('password', 180).notNullable()
      table.integer('role').defaultTo(UserRole.USER)
      table.string('bio', 255).nullable()
      table.integer('gender').nullable()
      table.string('remember_me_token').nullable()

      table.timestamp('banned_at', { useTz: true }).nullable()
      table.timestamp('confirmed_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
