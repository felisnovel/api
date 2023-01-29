import { test } from '@japa/runner'
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

    const response = await client.put(`/plans/${plan.id}/subscribe`).loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.equal(body.subscription.starts_at, DateTime.local().toFormat('yyyy-MM-dd'))

    assert.equal(
      body.subscription.ends_at,
      DateTime.local().plus({ days: 30 }).toFormat('yyyy-MM-dd')
    )
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

    const newPlan = await PlanFactory.merge({
      amount: 600,
    }).create()

    const response = await client.put(`/plans/${newPlan.id}/subscribe`).loginAs(user)
    response.assertStatus(200)

    const body = response.body()

    await firstSubscription.refresh()
    assert.equal(firstSubscription.amount, 100)
    assert.equal(firstSubscription.ends_at.toFormat('yyyy-MM-dd'), now.toFormat('yyyy-MM-dd'))

    assert.equal(body.subscription.starts_at, now.toFormat('yyyy-MM-dd'))
    assert.equal(body.subscription.ends_at, endsAt.toFormat('yyyy-MM-dd'))
    assert.equal(body.subscription.amount, 400)
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

    const newPlan = await PlanFactory.merge({
      amount: 1200,
    }).create()

    const response = await client.put(`/plans/${newPlan.id}/subscribe`).loginAs(user)
    response.assertStatus(200)

    const body = response.body()

    await firstSubscription.refresh()
    assert.equal(firstSubscription.amount, 200)
    assert.equal(firstSubscription.ends_at.toFormat('yyyy-MM-dd'), now.toFormat('yyyy-MM-dd'))

    assert.equal(body.subscription.starts_at, now.toFormat('yyyy-MM-dd'))
    assert.equal(body.subscription.ends_at, endsAt.toFormat('yyyy-MM-dd'))
    assert.equal(body.subscription.amount, 400)
  })
})
