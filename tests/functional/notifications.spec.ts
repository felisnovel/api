import { test } from '@japa/runner'
import NotificationFactory from 'Database/factories/NotificationFactory'
import UserFactory from 'Database/factories/UserFactory'
import { DateTime } from 'luxon'
import { cleanAll } from '../utils'

test.group('Notifications', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of notifications', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get('/notifications').loginAs(user)

    response.assertStatus(200)
  })

  test('get the last 2 months notifications', async ({ client, assert }) => {
    const user = await UserFactory.create()

    await NotificationFactory.merge({
      userId: user.id,
      readAt: DateTime.utc(),
    }).createMany(10)

    await NotificationFactory.merge({
      userId: user.id,
      readAt: DateTime.utc(),
      createdAt: DateTime.utc().minus({ months: 3 }),
    }).createMany(10)

    const response = await client.get('/notifications').loginAs(user)

    const body = await response.body()
    assert.equal(body.readNotifications.length, 10)

    response.assertStatus(200)
  })
})
