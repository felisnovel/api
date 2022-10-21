import Factory from '@ioc:Adonis/Lucid/Factory'
import UserGender from 'App/Enums/UserGender'
import UserRole from 'App/Enums/UserRole'
import User from 'App/Models/User'
import ChapterFactory from 'Database/factories/ChapterFactory'
import NovelFactory from 'Database/factories/NovelFactory'

export default Factory.define(User, ({ faker }) => {
  return {
    full_name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    username: faker.internet.userName(),
    role: faker.helpers.arrayElement(Object.values(UserRole)),
    gender: faker.helpers.arrayElement(Object.values(UserGender)),
    bio: faker.lorem.sentence(),
  }
})
  .relation('followNovels', () => NovelFactory)
  .relation('readChapters', () => ChapterFactory)
  .relation('likeNovels', () => NovelFactory)
  .relation('favorites', () => NovelFactory)
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
  .build()
