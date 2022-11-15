import { test } from '@japa/runner'
import OrderFactory from 'Database/factories/OrderFactory'
import UserFactory from 'Database/factories/UserFactory'
import OrderType from '../../app/Enums/OrderType'
import { cleanAll } from '../utils'

test.group('Orders', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of orders', async ({ client }) => {
    const response = await client.get('/orders')

    response.assertStatus(200)
  })

  test('delete a order', async ({ client, assert }) => {
    const admin = await UserFactory.apply('admin').create()
    const order = await OrderFactory.with('user', 1)
      .merge({
        type: OrderType.FREE,
        buy_type: null,
        is_paid: true,
      })
      .create()

    await order.user.refresh()

    assert.equal(order.amount, order.user.free_balance)

    const response = await client.delete(`/orders/` + order.id).loginAs(admin)

    await order.user.refresh()

    assert.equal(0, order.user.free_balance)

    response.assertStatus(200)
  })

  test('user cannot delete a order', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const order = await OrderFactory.with('user', 1).create()

    const response = await client.delete(`/orders/` + order.id).loginAs(user)

    response.assertStatus(403)
  })
})
