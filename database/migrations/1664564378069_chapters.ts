import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'chapters'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('volume_id').unsigned().notNullable()
      table.foreign('volume_id').references('volumes.id').onDelete('CASCADE')

      table.integer('novel_id').unsigned().notNullable()
      table.foreign('novel_id').references('novels.id').onDelete('CASCADE')

      table.string('title')
      table.integer('number')
      table.text('context')
      table.text('translation_note').nullable()
      table.boolean('is_premium')
      table.boolean('is_mature')

      table.integer('view_count').defaultTo(0)

      table.enu('publish_status', ['draft', 'published', 'unpublished'])

      table.integer('editor_id').nullable().unsigned()
      table.foreign('editor_id').references('users.id').onDelete('SET NULL')

      table.integer('translator_id').nullable().unsigned()
      table.foreign('translator_id').references('users.id').onDelete('SET NULL')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
