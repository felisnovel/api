import Factory from '@ioc:Adonis/Lucid/Factory'
import Tag from 'App/Models/Tag'

export default Factory.define(Tag, ({ faker }) => {
  return {
    name: faker.random.word(),
  }
}).build()
