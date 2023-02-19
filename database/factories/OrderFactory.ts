import Factory from '@ioc:Adonis/Lucid/Factory'
import OrderBuyType from 'App/Enums/OrderBuyType'
import OrderStatus from 'App/Enums/OrderStatus'
import UserFactory from 'Database/factories/UserFactory'
import OrderType from '../../app/Enums/OrderType'
import Order from '../../app/Models/Order'

export default Factory.define(Order, ({ faker }) => {
  const type = faker.helpers.arrayElement(Object.values(OrderType))
  const isFreeCoin = type === OrderType.FREE
  const buyType = isFreeCoin
    ? OrderBuyType.FREE
    : type === OrderType.COIN
    ? null
    : OrderBuyType.COIN
  const price = type === OrderType.COIN ? faker.datatype.number({ min: 1, max: 100 }) : null
  const amount = type !== OrderType.COIN ? faker.datatype.number({ min: 1, max: 100 }) : null
  const isPaid = isFreeCoin ? true : faker.datatype.boolean()

  return {
    price,
    buy_type: buyType,
    amount,
    status: isPaid ? OrderStatus.PAID : OrderStatus.UNPAID,
  }
})
  .relation('user', () => UserFactory)
  .build()
