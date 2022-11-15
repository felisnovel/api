import { test } from '@japa/runner'
import PlanFactory from 'Database/factories/PlanFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const PLAN_EXAMPLE_DATA = {
  name: 'Basic',
  amount: 19.99,
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

    const newData = PLAN_EXAMPLE_DATA

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
