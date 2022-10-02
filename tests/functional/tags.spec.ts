import { test } from '@japa/runner'
import TagFactory from 'Database/factories/TagFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const TAG_EXAMPLE_DATA = {
  name: 'Sex',
}

test.group('Tags', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of tags', async ({ client }) => {
    const response = await client.get('/tags')

    response.assertStatus(200)
  })

  test('create a tag', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const data = TAG_EXAMPLE_DATA

    const response = await client.post('/tags').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('user cannot create a tag', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const data = TAG_EXAMPLE_DATA

    const response = await client.post('/tags').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('show a tag', async ({ client }) => {
    const tag = await TagFactory.create()

    const response = await client.get(`/tags/` + tag.id)

    response.assertStatus(200)
  })

  test('update a tag', async ({ client }) => {
    const tag = await TagFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = TAG_EXAMPLE_DATA

    const response = await client
      .patch(`/tags/` + tag.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('user cannot update a tag', async ({ client }) => {
    const tag = await TagFactory.create()
    const user = await UserFactory.apply('user').create()

    const newData = TAG_EXAMPLE_DATA

    const response = await client
      .patch(`/tags/` + tag.id)
      .loginAs(user)
      .form(newData)

    response.assertStatus(403)
  })

  test('delete a tag', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const tag = await TagFactory.create()

    const response = await client.delete(`/tags/` + tag.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a tag', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const tag = await TagFactory.create()

    const response = await client.delete(`/tags/` + tag.id).loginAs(user)

    response.assertStatus(403)
  })
})
