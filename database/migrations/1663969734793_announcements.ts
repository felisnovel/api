import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import AnnouncementCategory from 'App/Enums/AnnouncementCategory'
import AnnouncementPublishStatus from '../../app/Enums/AnnouncementPublishStatus'

export default class extends BaseSchema {
  protected tableName = 'announcements'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('slug').unique()
      table.string('title')
      table.text('context')
      table.enu('category', Object.values(AnnouncementCategory)).notNullable()

      table.enu('publish_status', Object.values(AnnouncementPublishStatus))

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
