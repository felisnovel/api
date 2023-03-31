import { test } from '@japa/runner'
import OrderPaymentType from 'App/Enums/OrderPaymentType'
import OrderStatus from 'App/Enums/OrderStatus'
import PaytrService from 'App/Services/PaytrService'
import PlanFactory from 'Database/factories/PlanFactory'
import UserFactory from 'Database/factories/UserFactory'
import sinon from 'sinon'
import OrderType from '../../app/Enums/OrderType'
import { cleanAll } from '../utils'

const PLAN_EXAMPLE_DATA = {
  name: 'Van',
  amount: 350,
  no_ads: true,
  premium_eps: true,
  download: true,
  discord_features: true,
  is_promoted: false,
}

const NEW_PLAN_EXAMPLE_DATA = {
  name: 'Ankara',
  amount: 700,
  no_ads: false,
  premium_eps: false,
  download: false,
  discord_features: false,
  is_promoted: true,
}

test.group('Plans', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of plans', async ({ client }) => {
    const response = await client.get('/plans')

    response.assertStatus(200)
  })

  test('create a plan', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const data = PLAN_EXAMPLE_DATA

    const response = await client.post('/plans').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('user cannot create a plan', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const data = PLAN_EXAMPLE_DATA

    const response = await client.post('/plans').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('update a plan', async ({ client }) => {
    const plan = await PlanFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = NEW_PLAN_EXAMPLE_DATA

    const response = await client
      .patch(`/plans/` + plan.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('user cannot update a plan', async ({ client }) => {
    const plan = await PlanFactory.create()
    const user = await UserFactory.apply('user').create()

    const newData = PLAN_EXAMPLE_DATA

    const response = await client
      .patch(`/plans/` + plan.id)
      .loginAs(user)
      .form(newData)

    response.assertStatus(403)
  })

  test('delete a plan', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const plan = await PlanFactory.create()

    const response = await client.delete(`/plans/` + plan.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a plan', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const plan = await PlanFactory.create()

    const response = await client.delete(`/plans/` + plan.id).loginAs(user)

    response.assertStatus(403)
  })
})

test.group('Plan Subscriptions', (group) => {
  group.each.setup(cleanAll)

  test('purchase a plan', async ({ assert, client }) => {
    const user = await UserFactory.with('country', 1)
      .with('city', 1)
      .with('orders', 1, function (orderFactory) {
        return orderFactory.merge({
          type: OrderType.COIN,
          amount: 1000,
          status: OrderStatus.PAID,
        })
      })
      .create()
    await user.loadCount('subscribedPlans')

    const prevSubscribedPlansCount = Number(user.$extras.subscribedPlans_count)

    const plan = await PlanFactory.create()

    const responsePurchase = await client.post(`/plans/${plan.id}/purchase`).loginAs(user)
    responsePurchase.assertStatus(200)

    const order = responsePurchase.body().order

    const responsePay = await client
      .post(`/orders/${order.id}/pay`)
      .form({
        payment_type: OrderPaymentType.COIN,
      })
      .loginAs(user)
    responsePay.assertStatus(200)

    await user.loadCount('subscribedPlans')

    const newSubscribedPlansCount = Number(user.$extras.subscribedPlans_count)

    assert.equal(newSubscribedPlansCount, prevSubscribedPlansCount + 1)
  })

  test('purchase try to plan', async ({ assert, client }) => {
    const user = await UserFactory.with('country', 1).with('city', 1).create()
    const plan = await PlanFactory.create()
    const payment_type = OrderPaymentType.CARD

    const responsePlan = await client.post(`/plans/${plan.id}/purchase`).loginAs(user)
    responsePlan.assertStatus(200)
    const order = await responsePlan.body().order

    const mock = sinon.mock(PaytrService.prototype)
    mock.expects('createIframeToken').once().returns('dummyIframeToken')

    const responsePay = await client.post(`/orders/${order.id}/pay`).loginAs(user).form({
      payment_type,
    })

    mock.verify()
    mock.restore()

    responsePay.assertStatus(200)
    responsePay.assertBodyContains({
      iframe_token: 'dummyIframeToken',
    })

    await user.refresh()
    assert.equal(user.free_balance, 0)
    assert.equal(user.coin_balance, 0)
  })
})
