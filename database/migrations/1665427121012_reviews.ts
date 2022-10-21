import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'reviews'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.text('body').notNullable()

      table.integer('user_id').unsigned()
      table.foreign('user_id').references('users.id')

      table.integer('novel_id').unsigned()
      table.foreign('novel_id').references('novels.id')

      table.float('translation_quality').nullable()
      table.float('stability_of_update').nullable()
      table.float('story_development').nullable()
      table.float('character_design').nullable()
      table.float('world_background').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
