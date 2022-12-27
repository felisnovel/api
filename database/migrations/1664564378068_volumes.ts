import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'

export default class extends BaseSchema {
  protected tableName = 'volumes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('volume_novel_id').unsigned().notNullable()
      table.foreign('volume_novel_id').references('novels.id').onDelete('CASCADE')

      table.string('name').nullable()
      table.decimal('volume_number')

      table.enu('publish_status', Object.values(VolumePublishStatus))

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.unique(['volume_novel_id', 'volume_number'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
