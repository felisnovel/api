import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('global')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.boolean('global').notNullable().defaultTo(false)
    })
  }
}
