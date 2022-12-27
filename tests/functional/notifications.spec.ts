import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

test.group('Notifications', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of notifications', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get('/notifications').loginAs(user)

    response.assertStatus(200)
  })
})
