import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'notification_models'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('notificationable_type').nullable()
      table.integer('notificationable_id').nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
