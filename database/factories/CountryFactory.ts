import Factory from '@ioc:Adonis/Lucid/Factory'
import Country from 'App/Models/Country'
import CityFactory from './CityFactory'

export default Factory.define(Country, ({ faker }) => {
  return {
    name: faker.lorem.word(),
    key: faker.lorem.word(2),
  }
})
  .relation('cities', () => CityFactory)
  .build()
