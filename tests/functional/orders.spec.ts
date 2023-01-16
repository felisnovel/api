import { test } from '@japa/runner'
import OrderPaymentType from 'App/Enums/OrderPaymentType'
import OrderFactory from 'Database/factories/OrderFactory'
import PacketFactory from 'Database/factories/PacketFactory'
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
        amount: 10,
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

test.group('New order', (group) => {
  group.each.setup(cleanAll)

  test('create a order', async ({ client }) => {
    const user = await UserFactory.create()
    const packet = await PacketFactory.create()

    const purchaseResponse = await client
      .put(`/packets/` + packet.id + '/purchase')
      .loginAs(user)
      .form({
        name: 'test',
        phone: '5354511357',
        address: 'adres',
        payment_type: OrderPaymentType.CARD,
      })
    purchaseResponse.assertStatus(200)

    /*
    const data = await purchaseResponse.body()

    const callbackResponse = await client.post('/orders/callback').form({
      merchant_oid: data.merchantOid,
      status: 'success',
      total_amount: packet.price * 100,
      hash: data.iframeToken,
    })
    callbackResponse.assertStatus(200)
    */
  })
})
