import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'invoice_order'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('invoice_id').nullable().unsigned()
      table.foreign('invoice_id').references('invoices.id').onDelete('CASCADE')

      table.integer('order_id').nullable().unsigned()
      table.foreign('order_id').references('orders.id').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
