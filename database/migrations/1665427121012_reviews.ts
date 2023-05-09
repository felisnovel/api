import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'reviews'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.text('body').notNullable()

      table.boolean('is_pinned').defaultTo(false)

      table.boolean('is_spoiler').defaultTo(false)

      table.integer('user_id').unsigned()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')

      table.integer('novel_id').unsigned()
      table.foreign('novel_id').references('novels.id').onDelete('CASCADE')

      table.boolean('is_recommended').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
