import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'novel_tag'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('novel_id').unsigned()
      table.foreign('novel_id').references('novels.id')

      table.integer('tag_id').unsigned()
      table.foreign('tag_id').references('tags.id')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
