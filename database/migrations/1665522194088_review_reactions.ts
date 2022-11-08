import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import ReactionTypeEnum from 'App/Enums/ReactionTypeEnum'

export default class extends BaseSchema {
  protected tableName = 'review_reactions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().notNullable()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')

      table.integer('review_id').unsigned().notNullable()
      table.foreign('review_id').references('reviews.id').onDelete('CASCADE')

      table.enum('type', Object.values(ReactionTypeEnum)).notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
