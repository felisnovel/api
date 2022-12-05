import { test } from '@japa/runner'
import PromocodeFactory from 'Database/factories/PromocodeFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const PROMOCODE_EXAMPLE_DATA = {
  name: 'Yılbaşı Promosyonu (Eski)',
  code: 'YILBASI2022',
  active: true,
  limit: 100,
  amount: 100,
}

const NEW_PROMOCODE_EXAMPLE_DATA = {
  name: 'Yılbaşı Promosyonu',
  code: 'YILBASI2023',
  active: false,
  limit: 250,
  amount: 250,
}

test.group('Promocodes', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of promocodes', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.get('/promocodes').loginAs(admin)

    response.assertStatus(200)
  })

  test('create a promocode', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const data = PROMOCODE_EXAMPLE_DATA

    const response = await client.post('/promocodes').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('user cannot create a promocode', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const data = PROMOCODE_EXAMPLE_DATA

    const response = await client.post('/promocodes').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('update a promocode', async ({ client }) => {
    const promocode = await PromocodeFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = NEW_PROMOCODE_EXAMPLE_DATA

    const response = await client
      .patch(`/promocodes/` + promocode.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('user cannot update a promocode', async ({ client }) => {
    const promocode = await PromocodeFactory.create()
    const user = await UserFactory.apply('user').create()

    const newData = PROMOCODE_EXAMPLE_DATA

    const response = await client
      .patch(`/promocodes/` + promocode.id)
      .loginAs(user)
      .form(newData)

    response.assertStatus(403)
  })

  test('delete a promocode', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const promocode = await PromocodeFactory.create()

    const response = await client.delete(`/promocodes/` + promocode.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a promocode', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const promocode = await PromocodeFactory.create()

    const response = await client.delete(`/promocodes/` + promocode.id).loginAs(user)

    response.assertStatus(403)
  })
})
