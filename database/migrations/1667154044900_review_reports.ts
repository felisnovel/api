import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'review_reports'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.text('body').notNullable()

      table.integer('review_id').unsigned()
      table.foreign('review_id').references('reviews.id').onDelete('CASCADE')

      table.integer('user_id').unsigned()
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
