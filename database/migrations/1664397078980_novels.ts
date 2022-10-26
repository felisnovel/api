import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'novels'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name')
      table.string('other_names').nullable()
      table.string('slug').unique()
      table.string('shorthand')
      table.string('image').nullable()
      table.string('cover_image').nullable()
      table.text('description')
      table.string('author')
      table.string('license_holder').nullable()

      table.enu('status', ['ongoing', 'completed'])
      table.enu('publish_status', ['draft', 'published', 'unpublished'])
      table.enu('translation_status', ['soon', 'ongoing', 'completed', 'dropped'])

      table.integer('view_count').defaultTo(0)

      table.boolean('is_mature').defaultTo(false)
      table.boolean('is_premium').defaultTo(false)
      table.boolean('is_promoted').defaultTo(false)

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
