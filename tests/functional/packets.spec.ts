import { test } from '@japa/runner'
import OrderPaymentType from 'App/Enums/OrderPaymentType'
import PaytrService from 'App/Services/PaytrService'
import OrderFactory from 'Database/factories/OrderFactory'
import PacketFactory from 'Database/factories/PacketFactory'
import UserFactory from 'Database/factories/UserFactory'
import sinon from 'sinon'
import { cleanAll } from '../utils'

const PACKET_EXAMPLE_DATA = {
  name: '10 Coin',
  original_price: 10,
  discount_rate: 0,
  amount: 10,
  is_promoted: false,
}

const NEW_PACKET_EXAMPLE_DATA = {
  name: '20 Coin',
  original_price: 20,
  discount_rate: 20,
  amount: 20,
  is_promoted: true,
}

test.group('Packets', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of packets', async ({ client }) => {
    const response = await client.get('/packets')

    response.assertStatus(200)
  })

  test('create a packet', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const data = PACKET_EXAMPLE_DATA

    const response = await client.post('/packets').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('user cannot create a packet', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const data = PACKET_EXAMPLE_DATA

    const response = await client.post('/packets').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('show a packet', async ({ client }) => {
    const packet = await PacketFactory.create()

    const response = await client.get(`/packets/` + packet.id)

    response.assertStatus(200)
  })

  test('update a packet', async ({ client }) => {
    const packet = await PacketFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = NEW_PACKET_EXAMPLE_DATA

    const response = await client
      .patch(`/packets/` + packet.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('user cannot update a packet', async ({ client }) => {
    const packet = await PacketFactory.create()
    const user = await UserFactory.apply('user').create()

    const newData = PACKET_EXAMPLE_DATA

    const response = await client
      .patch(`/packets/` + packet.id)
      .loginAs(user)
      .form(newData)

    response.assertStatus(403)
  })

  test('delete a packet', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const packet = await PacketFactory.create()

    const response = await client.delete(`/packets/` + packet.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a packet', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const packet = await PacketFactory.create()

    const response = await client.delete(`/packets/` + packet.id).loginAs(user)

    response.assertStatus(403)
  })
})

test.group('Purchase Packets', (group) => {
  group.each.setup(cleanAll)

  test('purchase eft to packet', async ({ client }) => {
    const user = await UserFactory.with('country', 1).with('city', 1).create()
    const packet = await PacketFactory.create()
    const payment_type = OrderPaymentType.EFT

    const mock = sinon.mock(PaytrService.prototype)
    mock.expects('createIframeToken').once().returns('dummyIframeToken')

    const response = await client.put(`/packets/${packet.id}/purchase`).loginAs(user).form({
      payment_type,
    })

    mock.verify()
    mock.restore()

    response.assertStatus(200)
    response.assertBodyContains({
      iframe_token: 'dummyIframeToken',
    })
  })

  test('purchase card to packet', async ({ client }) => {
    const user = await UserFactory.with('country', 1).with('city', 1).create()
    const packet = await PacketFactory.create()
    const payment_type = OrderPaymentType.CARD

    const mock = sinon.mock(PaytrService.prototype)
    mock.expects('createIframeToken').once().returns('dummyIframeToken')

    const response = await client.put(`/packets/${packet.id}/purchase`).loginAs(user).form({
      payment_type,
    })

    mock.verify()
    mock.restore()

    response.assertStatus(200)
    response.assertBodyContains({
      iframe_token: 'dummyIframeToken',
    })
  })

  test('callback', async ({ assert, client }) => {
    const order = await OrderFactory.with('user', 1)
      .merge({
        is_paid: false,
        payment_reference: 'dummyPaymentReference',
        price: 10,
      })
      .create()

    const mock = sinon.mock(PaytrService.prototype)
    mock.expects('verifyPayment').once().returns(true)

    const response = await client.post(`/orders/callback`).form({
      merchant_oid: 'dummyPaymentReference',
      status: 'success',
      total_amount: 10,
      currency: 'TL',
      hash: 'dummyHash',
    })

    mock.verify()
    mock.restore()

    response.assertStatus(200)

    await order.refresh()
    assert.equal(order.is_paid, true)
  })
})
