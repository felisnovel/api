import BaseSchema from '@ioc:Adonis/Lucid/Schema'

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
      table.foreign('packet_id').references('packets.id').onDelete('RESTRICT')

      table.integer('chapter_id').nullable().unsigned()
      table.foreign('chapter_id').references('chapters.id').onDelete('CASCADE')

      table.integer('plan_id').nullable().unsigned()
      table.foreign('plan_id').references('plans.id').onDelete('CASCADE')

      table.integer('user_id').notNullable().unsigned()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')

      table.boolean('is_paid').defaultTo(true)

      table.timestamp('starts_at', { useTz: true })
      table.timestamp('ends_at', { useTz: true })

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
