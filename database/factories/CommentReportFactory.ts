import Factory from '@ioc:Adonis/Lucid/Factory'
import CommentFactory from 'Database/factories/CommentFactory'
import CommentReport from '../../app/Models/CommentReport'

export default Factory.define(CommentReport, ({ faker }) => {
  return {
    body: faker.lorem.paragraph(),
  }
})
  .relation('comment', () => CommentFactory)
  .build()
