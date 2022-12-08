import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Promocodes extends BaseSchema {
  protected tableName = 'promocodes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name')
      table.string('code').unique()
      table.decimal('amount')
      table.boolean('active').defaultTo(true)
      table.integer('used').defaultTo(0)
      table.integer('limit').defaultTo(0)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
