import Factory from '@ioc:Adonis/Lucid/Factory'
import UserRole from 'App/Enums/UserRole'
import User from 'App/Models/User'

export default Factory.define(User, ({ faker }) => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    username: faker.name.findName(),
    role: faker.helpers.arrayElement(Object.values(UserRole)),
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
