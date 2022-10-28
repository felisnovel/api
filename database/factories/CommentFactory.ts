import Factory from '@ioc:Adonis/Lucid/Factory'
import Comment from 'App/Models/Comment'
import ChapterFactory from 'Database/factories/ChapterFactory'
import CommentFactory from 'Database/factories/CommentFactory'
import UserFactory from './UserFactory'

export default Factory.define(Comment, ({ faker }) => {
  return {
    body: faker.lorem.paragraph(),
  }
})
  .relation('subComments', () => CommentFactory)
  .relation('chapter', () => ChapterFactory)
  .relation('parent', () => CommentFactory)
  .relation('user', () => UserFactory)
  .build()
