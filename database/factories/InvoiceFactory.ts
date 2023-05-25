import Factory from '@ioc:Adonis/Lucid/Factory'
import Invoice from 'App/Models/Invoice'
import OrderFactory from './OrderFactory'
import UserFactory from './UserFactory'

export default Factory.define(Invoice, ({ faker }) => {
  return {
    net_total: faker.datatype.number({ min: 1, max: 100 }),
  }
})
  .relation('user', () => UserFactory)
  .relation('orders', () => OrderFactory)
  .build()
