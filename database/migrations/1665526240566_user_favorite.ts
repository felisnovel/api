import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'user_favorite'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('user_id').unsigned()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')

      table.integer('novel_id').unsigned()
      table.foreign('novel_id').references('novels.id').onDelete('CASCADE')

      table.integer('order').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
