import Factory from '@ioc:Adonis/Lucid/Factory'
import Review from 'App/Models/Review'
import NovelFactory from './NovelFactory'
import UserFactory from './UserFactory'

export default Factory.define(Review, ({ faker }) => {
  return {
    body: faker.lorem.paragraph(),
    is_recommended: faker.datatype.boolean(),
  }
})
  .relation('novel', () => NovelFactory)
  .relation('user', () => UserFactory)
  .build()
