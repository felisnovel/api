import Factory from '@ioc:Adonis/Lucid/Factory'
import Country from 'App/Models/Country'

export default Factory.define(Country, ({ faker }) => {
  return {
    name: faker.lorem.word(),
    key: faker.lorem.word(2),
  }
}).build()
