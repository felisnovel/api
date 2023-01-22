import Factory from '@ioc:Adonis/Lucid/Factory'
import ContactStatus from 'App/Enums/ContactStatus'
import ContactType from 'App/Enums/ContactType'
import Contact from 'App/Models/Contact'
import UserFactory from './UserFactory'

export default Factory.define(Contact, ({ faker }) => {
  return {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    message: faker.lorem.paragraph(),
    type: faker.helpers.arrayElement(Object.values(ContactType)),
    status: faker.helpers.arrayElement(Object.values(ContactStatus)),
  }
})
  .relation('user', () => UserFactory)
  .build()
