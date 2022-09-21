import Factory from '@ioc:Adonis/Lucid/Factory'
import UserRole from 'App/Enums/UserRole'
import Country from 'App/Models/Country'
import User from 'App/Models/User'

export const CountryFactory = Factory.define(Country, ({ faker }) => {
  const selectedCountry = faker.address

  return {
    name: selectedCountry.county.toString(),
    key: selectedCountry.countryCode.name.toString(),
  }
}).build()

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
