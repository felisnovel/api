import Factory from '@ioc:Adonis/Lucid/Factory'
import City from 'App/Models/City'
import CountryFactory from 'Database/factories/CountryFactory'

export default Factory.define(City, ({ faker }) => {
  return {
    name: faker.lorem.word(),
  }
})
  .relation('country', () => CountryFactory)
  .build()
