import Factory from '@ioc:Adonis/Lucid/Factory'
import UserRole from 'App/Enums/UserRole'
import User from 'App/Models/User'

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    username: faker.name.findName(),
  }
})
  .state('admin', async (item) => {
    item.role = UserRole.ADMIN
  })
  .build()
