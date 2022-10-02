import Factory from '@ioc:Adonis/Lucid/Factory'
import UserGender from 'App/Enums/UserGender'
import UserRole from 'App/Enums/UserRole'
import User from 'App/Models/User'

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
