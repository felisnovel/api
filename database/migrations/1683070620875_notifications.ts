import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import NotificationType from '../../app/Enums/NotificationType'

export default class Notifications extends BaseSchema {
  protected tableName = 'notifications'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.boolean('global').notNullable().defaultTo(false)
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('initiator_user_id').unsigned().references('id').inTable('users').nullable()
      table.enum('type', Object.values(NotificationType)).notNullable()
      table.string('notificationable_type').nullable()
      table.integer('notificationable_id').nullable()
      table.text('body').nullable()
      table.string('href').nullable()
      table.timestamp('read_at').nullable()
      table.timestamp('actioned_at').nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
