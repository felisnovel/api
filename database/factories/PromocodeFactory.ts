import Factory from '@ioc:Adonis/Lucid/Factory'
import Promocode from 'App/Models/Promocode'
import OrderFactory from 'Database/factories/OrderFactory'

export default Factory.define(Promocode, ({ faker }) => {
  return {
    name: faker.lorem.words(1) + ' Promosyon Kodu',
    code: faker.lorem.slug(2).toUpperCase(),
    active: true,
    limit: faker.datatype.number(faker.datatype.number({ min: 1, max: 50 })),
    amount: faker.datatype.number(faker.datatype.number({ min: 1, max: 50 })),
  }
})
  .relation('orders', () => OrderFactory)
  .build()
