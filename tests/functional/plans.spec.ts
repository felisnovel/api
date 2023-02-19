import { test } from '@japa/runner'
import OrderStatus from 'App/Enums/OrderStatus'
import PlanFactory from 'Database/factories/PlanFactory'
import UserFactory from 'Database/factories/UserFactory'
import OrderType from '../../app/Enums/OrderType'
import { cleanAll } from '../utils'

const PLAN_EXAMPLE_DATA = {
  name: 'Basic',
  amount: 19.99,
  no_ads: true,
  premium_eps: true,
  download: true,
  discord_features: true,
  is_promoted: false,
}

const NEW_PLAN_EXAMPLE_DATA = {
  name: 'Pro',
  amount: 29.99,
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

  test('subscribe a plan', async ({ assert, client }) => {
    const user = await UserFactory.with('orders', 1, function (orderFactory) {
      return orderFactory.merge({
        type: OrderType.COIN,
        amount: 100,
        status: OrderStatus.PAID,
      })
    }).create()
    await user.loadCount('subscribedPlans')

    const prevSubscribedPlansCount = Number(user.$extras.subscribedPlans_count)

    const plan = await PlanFactory.create()

    const response = await client.put(`/plans/${plan.id}/subscribe`).loginAs(user)
    response.assertStatus(200)

    await user.loadCount('subscribedPlans')

    const newSubscribedPlansCount = Number(user.$extras.subscribedPlans_count)

    assert.equal(newSubscribedPlansCount, prevSubscribedPlansCount + 1)
  })
})
