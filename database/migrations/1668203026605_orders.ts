import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import OrderBuyType from 'App/Enums/OrderBuyType'
import OrderPaymentType from 'App/Enums/OrderPaymentType'
import OrderStatus from 'App/Enums/OrderStatus'
import OrderType from 'App/Enums/OrderType'

export default class extends BaseSchema {
  protected tableName = 'orders'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name')
      table.decimal('amount').nullable()
      table.decimal('price').nullable()

      table.enum('type', Object.values(OrderType))
      table.enum('buy_type', Object.values(OrderBuyType)).nullable()

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
      table.enum('payment_type', Object.values(OrderPaymentType)).nullable()
      table.string('payment_reference').nullable()

      table.integer('invoice_id').nullable().unsigned()
      table.foreign('invoice_id').references('invoices.id').onDelete('SET NULL')

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
