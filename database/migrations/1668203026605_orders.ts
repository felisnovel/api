import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import OrderStatus from 'App/Enums/OrderStatus'

export default class extends BaseSchema {
  protected tableName = 'orders'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name')
      table.decimal('amount').nullable()
      table.decimal('price').nullable()

      table.enum('type', ['free', 'coin', 'chapter', 'plan'])
      table.enum('buy_type', ['free', 'coin']).nullable()

      table.integer('packet_id').nullable().unsigned()
      table.foreign('packet_id').references('packets.id').onDelete('SET NULL')

      table.integer('chapter_id').nullable().unsigned()
      table.foreign('chapter_id').references('chapters.id').onDelete('SET NULL')

      table.integer('plan_id').nullable().unsigned()
      table.foreign('plan_id').references('plans.id').onDelete('SET NULL')

      table.integer('user_id').notNullable().unsigned()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')

      table.integer('promocode_id').nullable().unsigned()
      table.foreign('promocode_id').references('promocodes.id').onDelete('SET NULL')

      table.enum('status', Object.values(OrderStatus)).defaultTo(OrderStatus.UNPAID)

      table.string('payment_type').nullable()
      table.string('payment_reference').nullable()

      table.date('starts_at')
      table.date('ends_at')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.unique(['promocode_id', 'user_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
