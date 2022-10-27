import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.text('body').notNullable()

      table.boolean('is_pinned').defaultTo(false)

      table.boolean('is_spoiler').defaultTo(false)

      table.integer('parent_id').unsigned().nullable()
      table.foreign('parent_id').references('comments.id')

      table.integer('user_id').unsigned()
      table.foreign('user_id').references('users.id')

      table.integer('chapter_id').unsigned()
      table.foreign('chapter_id').references('chapters.id')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
