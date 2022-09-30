import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'volumes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('novel_id').unsigned()
      table.foreign('novel_id').references('novels.id').onDelete('CASCADE')

      table.string('name').nullable()
      table.integer('number')

      table.enu('publish_status', ['draft', 'published', 'unpublished'])

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
