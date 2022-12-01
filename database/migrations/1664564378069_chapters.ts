import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'

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

      table.enu('publish_status', Object.values(ChapterPublishStatus))

      table.string('editor').nullable()
      table.string('translator').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.unique(['number', 'volume_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
