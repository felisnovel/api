import { test } from '@japa/runner'
import CountryFactory from 'Database/factories/CountryFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const COUNTRY_EXAMPLE_DATA = {
  name: 'Turkey',
  key: 'TR',
}

test.group('Countries', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of countries', async ({ client }) => {
    const response = await client.get('/countries')

    response.assertStatus(200)
  })

  test('create a country', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const data = COUNTRY_EXAMPLE_DATA

    const response = await client.post('/countries').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('user cannot create a country', async ({ client }) => {
    const user = await UserFactory.create()

    const data = COUNTRY_EXAMPLE_DATA

    const response = await client.post('/countries').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('update a country', async ({ client }) => {
    const country = await CountryFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = COUNTRY_EXAMPLE_DATA

    const response = await client.patch(`/countries/${country.id}`).loginAs(admin).form(newData)

    response.assertStatus(200)
    response.assertBodyContains({
      id: country.id,
      ...newData,
    })
  })

  test('user cannot update a country', async ({ client }) => {
    const country = await CountryFactory.create()
    const user = await UserFactory.create()

    const newData = COUNTRY_EXAMPLE_DATA

    const response = await client.patch(`/countries/${country.id}`).loginAs(user).form(newData)

    response.assertStatus(403)
  })

  test('delete a country', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const country = await CountryFactory.create()

    const response = await client.delete(`/countries/${country.id}`).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a country', async ({ client }) => {
    const user = await UserFactory.create()
    const country = await CountryFactory.create()

    const response = await client.delete(`/countries/${country.id}`).loginAs(user)

    response.assertStatus(403)
  })
})
