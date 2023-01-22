import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import ContactStatus from 'App/Enums/ContactStatus'
import ContactType from 'App/Enums/ContactType'

export default class extends BaseSchema {
  protected tableName = 'contacts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enu('type', Object.values(ContactType))
      table.string('name')
      table.string('email').nullable()
      table.string('phone').nullable()
      table.text('message')
      table.enu('status', Object.values(ContactStatus)).defaultTo(ContactStatus.NEW)

      table.integer('user_id').nullable().unsigned()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')

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
