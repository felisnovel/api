import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'

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
      table.text('context')
      table.string('author')
      table.string('license_holder').nullable()

      table.enu('status', Object.values(NovelStatus))
      table.enu('publish_status', Object.values(NovelPublishStatus))
      table.enu('translation_status', Object.values(NovelTranslationStatus))

      table.integer('view_count').defaultTo(0)

      table.boolean('is_mature').defaultTo(false)
      table.boolean('is_premium').defaultTo(false)
      table.boolean('is_promoted').defaultTo(false)

      table.decimal('free_amount').nullable()
      table.decimal('coin_amount').nullable()

      table.string('editor').nullable()
      table.string('translator').nullable()

      table.integer('country_id').nullable().unsigned()
      table.foreign('country_id').references('countries.id').onDelete('SET NULL')

      table.integer('user_id').notNullable().unsigned()
      table.foreign('user_id').references('users.id').onDelete('SET NULL')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
