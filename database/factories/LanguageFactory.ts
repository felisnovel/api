import Factory from '@ioc:Adonis/Lucid/Factory'
import Language from 'App/Models/Language'

export default Factory.define(Language, ({ faker }) => {
  return {
    name: faker.lorem.word(),
    key: faker.lorem.word(2),
  }
}).build()
