import Factory from '@ioc:Adonis/Lucid/Factory'
import ReactionTypeEnum from 'App/Enums/ReactionTypeEnum'
import CommentFactory from 'Database/factories/CommentFactory'
import CommentReaction from '../../app/Models/CommentReaction'
import UserFactory from './UserFactory'

export default Factory.define(CommentReaction, ({ faker }) => {
  return {
    type: faker.helpers.arrayElement(Object.values(ReactionTypeEnum)),
  }
})
  .relation('comment', () => CommentFactory)
  .relation('user', () => UserFactory)
  .build()
