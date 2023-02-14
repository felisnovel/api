import Factory from '@ioc:Adonis/Lucid/Factory'
import Invoice from 'App/Models/Invoice'
import UserFactory from './UserFactory'

export default Factory.define(Invoice, ({ faker }) => {
  return {
    net_total: faker.datatype.number({ min: 1, max: 100 }),
    document_id: faker.datatype.uuid(),
  }
})
  .relation('user', () => UserFactory)
  .build()
