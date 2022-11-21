import { test } from '@japa/runner'
import PacketFactory from 'Database/factories/PacketFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const PACKET_EXAMPLE_DATA = {
  name: '10 Coin',
  price: 10,
  amount: 10,
  is_promoted: false,
}

const NEW_PACKET_EXAMPLE_DATA = {
  name: '20 Coin',
  price: 20,
  amount: 20,
  is_promoted: true,
}

test.group('Packets', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of packets', async ({ client }) => {
    const response = await client.get('/packets')

    response.assertStatus(200)
  })

  test('create a packet', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const data = PACKET_EXAMPLE_DATA

    const response = await client.post('/packets').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('user cannot create a packet', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const data = PACKET_EXAMPLE_DATA

    const response = await client.post('/packets').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('update a packet', async ({ client }) => {
    const packet = await PacketFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = NEW_PACKET_EXAMPLE_DATA

    const response = await client
      .patch(`/packets/` + packet.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('user cannot update a packet', async ({ client }) => {
    const packet = await PacketFactory.create()
    const user = await UserFactory.apply('user').create()

    const newData = PACKET_EXAMPLE_DATA

    const response = await client
      .patch(`/packets/` + packet.id)
      .loginAs(user)
      .form(newData)

    response.assertStatus(403)
  })

  test('delete a packet', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const packet = await PacketFactory.create()

    const response = await client.delete(`/packets/` + packet.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a packet', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const packet = await PacketFactory.create()

    const response = await client.delete(`/packets/` + packet.id).loginAs(user)

    response.assertStatus(403)
  })
})
