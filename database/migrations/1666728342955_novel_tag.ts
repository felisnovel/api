import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'novel_tag'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('novel_id').unsigned().notNullable()
      table.foreign('novel_id').references('novels.id').onDelete('CASCADE')

      table.integer('tag_id').unsigned().notNullable()
      table.foreign('tag_id').references('tags.id').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
