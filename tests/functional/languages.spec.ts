import { test } from '@japa/runner'
import LanguageFactory from 'Database/factories/LanguageFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const LANGUAGE_EXAMPLE_DATA = {
  name: 'Turkish',
  key: 'TR',
}

test.group('Languages', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of languages', async ({ client }) => {
    const response = await client.get('/languages')

    response.assertStatus(200)
  })

  test('create a language', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const data = LANGUAGE_EXAMPLE_DATA

    const response = await client.post('/languages').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('user cannot create a language', async ({ client }) => {
    const user = await UserFactory.create()

    const data = LANGUAGE_EXAMPLE_DATA

    const response = await client.post('/languages').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('update a language', async ({ client }) => {
    const language = await LanguageFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = LANGUAGE_EXAMPLE_DATA

    const response = await client
      .patch(`/languages/` + language.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains({
      id: language.id,
      ...newData,
    })
  })

  test('user cannot update a language', async ({ client }) => {
    const language = await LanguageFactory.create()
    const user = await UserFactory.create()

    const newData = LANGUAGE_EXAMPLE_DATA

    const response = await client
      .patch(`/languages/` + language.id)
      .loginAs(user)
      .form(newData)

    response.assertStatus(403)
  })

  test('delete a language', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const language = await LanguageFactory.create()

    const response = await client.delete(`/languages/` + language.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a language', async ({ client }) => {
    const user = await UserFactory.create()
    const language = await LanguageFactory.create()

    const response = await client.delete(`/languages/` + language.id).loginAs(user)

    response.assertStatus(403)
  })
})
