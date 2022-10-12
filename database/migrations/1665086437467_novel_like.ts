import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'novel_like'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('user_id').unsigned()
      table.foreign('user_id').references('users.id')

      table.integer('novel_id').unsigned()
      table.foreign('novel_id').references('novels.id')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
