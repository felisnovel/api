import Factory from '@ioc:Adonis/Lucid/Factory'
import UserGender from 'App/Enums/UserGender'
import UserRole from 'App/Enums/UserRole'
import User from 'App/Models/User'
import ChapterFactory from 'Database/factories/ChapterFactory'
import CommentFactory from 'Database/factories/CommentFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import OrderFactory from 'Database/factories/OrderFactory'
import ReviewFactory from 'Database/factories/ReviewFactory'
import { addDays } from 'date-fns'
import { DateTime } from 'luxon'
import CommentReactionFactory from './CommentReactionFactory'

export default Factory.define(User, ({ faker }) => {
  return {
    full_name: faker.name.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    username: faker.internet.userName().replace(/[^a-zA-Z0-9]/g, ''),
    role: faker.helpers.arrayElement(Object.values(UserRole)),
    gender: faker.helpers.arrayElement(Object.values(UserGender)),
    bio: faker.lorem.sentence(),
    facebook_handle: faker.internet.userName(),
    twitter_handle: faker.internet.userName(),
    instagram_handle: faker.internet.userName(),
    youtube_handle: faker.internet.userName(),
  }
})
  .relation('followNovels', () => NovelFactory)
  .relation('readChapters', () => ChapterFactory)
  .relation('likeNovels', () => NovelFactory)
  .relation('favorites', () => NovelFactory)
  .relation('reviews', () => ReviewFactory)
  .relation('comments', () => CommentFactory)
  .relation('commentReactions', () => CommentReactionFactory)
  .relation('orders', () => OrderFactory)
  .state('admin', async (item) => {
    item.role = UserRole.ADMIN
  })
  .state('editor', async (item) => {
    item.role = UserRole.EDITOR
  })
  .state('translator', async (item) => {
    item.role = UserRole.TRANSLATOR
  })
  .state('user', async (item) => {
    item.role = UserRole.USER
  })
  .state('muted', (item) => {
    item.mutedAt = DateTime.now().set({ year: 2099 })
  })
  .build()
