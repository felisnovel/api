import { test } from '@japa/runner'
import OrderPaymentType from 'App/Enums/OrderPaymentType'
import OrderService from 'App/Services/OrderService'
import SubscriptionService from 'App/Services/SubscriptionService'
import PlanFactory from 'Database/factories/PlanFactory'
import UserFactory from 'Database/factories/UserFactory'
import { DateTime } from 'luxon'
import { cleanAll } from '../utils'

test.group('Subscriptions', (group) => {
  group.each.setup(cleanAll)

  test('new subscription', async ({ client, assert }) => {
    const plan = await PlanFactory.create()
    const user = await UserFactory.create()
    await OrderService.addCoin(user, 1000, 'Hediye Coin')

    const response = await client.post(`/plans/${plan.id}/purchase`).loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.equal(body.order.starts_at, DateTime.local().toFormat('yyyy-MM-dd'))

    assert.equal(body.order.ends_at, DateTime.local().plus({ days: 30 }).toFormat('yyyy-MM-dd'))
  })

  test('upgrade subscription 1', async ({ client, assert }) => {
    const plan = await PlanFactory.merge({
      amount: 300,
    }).create()
    const user = await UserFactory.create()
    await OrderService.addCoin(user, 1000, 'Hediye Coin')

    const startsAt = DateTime.local().minus({ days: 10 })
    const endsAt = DateTime.local().plus({ days: 20 })
    const now = DateTime.local()

    const firstSubscription = await SubscriptionService.newSubscription(
      user,
      plan,
      startsAt,
      endsAt
    )

    await OrderService.pay({
      order: firstSubscription,
      user,
      payment_type: OrderPaymentType.COIN,
      user_ip: '127.0.0.1',
    })

    const newPlan = await PlanFactory.merge({
      amount: 600,
    }).create()

    const response = await client.post(`/plans/${newPlan.id}/upgrade`).loginAs(user)
    response.assertStatus(200)

    const body = await response.body()

    await firstSubscription.refresh()
    assert.equal(firstSubscription.amount, 100)
    assert.equal(firstSubscription.ends_at.toFormat('yyyy-MM-dd'), now.toFormat('yyyy-MM-dd'))

    assert.equal(body.order.starts_at, now.toFormat('yyyy-MM-dd'))
    assert.equal(body.order.ends_at, endsAt.toFormat('yyyy-MM-dd'))
    assert.equal(body.order.amount, 400)
  })

  test('upgrade subscription 2', async ({ client, assert }) => {
    const plan = await PlanFactory.merge({
      amount: 600,
    }).create()
    const user = await UserFactory.create()
    await OrderService.addCoin(user, 2000, 'Hediye Coin')

    const startsAt = DateTime.local().minus({ days: 10 })
    const endsAt = DateTime.local().plus({ days: 10 })
    const now = DateTime.local()

    const firstSubscription = await SubscriptionService.newSubscription(
      user,
      plan,
      startsAt,
      endsAt
    )

    await OrderService.pay({
      order: firstSubscription,
      user,
      payment_type: OrderPaymentType.COIN,
      user_ip: '127.0.0.1',
    })

    const newPlan = await PlanFactory.merge({
      amount: 1200,
    }).create()

    const response = await client.post(`/plans/${newPlan.id}/upgrade`).loginAs(user)
    response.assertStatus(200)

    const body = response.body()

    await firstSubscription.refresh()
    assert.equal(firstSubscription.amount, 200)
    assert.equal(firstSubscription.ends_at.toFormat('yyyy-MM-dd'), now.toFormat('yyyy-MM-dd'))

    assert.equal(body.order.starts_at, now.toFormat('yyyy-MM-dd'))
    assert.equal(body.order.ends_at, endsAt.toFormat('yyyy-MM-dd'))
    assert.equal(body.order.amount, 400)
  })

  /*
  test('upgrade subscription for preview', async ({ client, assert }) => {
    const plan = await PlanFactory.merge({
      amount: 600,
    }).create()
    const user = await UserFactory.create()
    await OrderService.addCoin(user, 2000, 'Hediye Coin')

    const startsAt = DateTime.local().minus({ days: 10 })
    const endsAt = DateTime.local().plus({ days: 20 })

    const firstSubscription = await SubscriptionService.newSubscription(
      user,
      plan,
      startsAt,
      endsAt
    )

    const newPlan = await PlanFactory.merge({
      amount: 1200,
    }).create()

    const response = await client.put(`/plans/${newPlan.id}/subscribe?preview=true`).loginAs(user)
    response.assertStatus(200)

    const body = response.body()

    await firstSubscription.refresh()
    assert.equal(body.order.activePlan.prevAmount, 600)
    assert.equal(body.order.activePlan.newAmount, 200)

    assert.equal(body.order.newPlan.prevAmount, 1200)
    assert.equal(body.order.newPlan.newAmount, 800)
  })
  */
})
