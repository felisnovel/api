import { test } from '@japa/runner'
import UserGender from 'App/Enums/UserGender'
import UserRole from 'App/Enums/UserRole'
import NovelFactory from 'Database/factories/NovelFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const USER_EXAMPLE_DATA = {
  full_name: 'Ahmet Mehmet',
  email: 'admin@felisnovel.com',
  username: 'admin',
  role: UserRole.ADMIN,
  bio: "I'm a bio",
  gender: UserGender.MALE,
}

const NEW_USER_EXAMPLE_DATA = {
  full_name: 'Yeni Ahmet Mehmet',
  email: 'yeniadmin@felisnovel.com',
  username: 'yeniadmin',
  role: UserRole.EDITOR,
  bio: "Yeni I'm a bio",
  gender: UserGender.FEMALE,
}

test.group('Users', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of users', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const response = await client.get('/users').loginAs(admin)

    response.assertStatus(200)
  })

  test('show a user', async ({ client }) => {
    const user = await UserFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const response = await client.get(`/users/` + user.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('update a user', async ({ client }) => {
    const user = await UserFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = NEW_USER_EXAMPLE_DATA

    const response = await client
      .patch(`/users/` + user.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('user cannot update a user', async ({ client }) => {
    const user1 = await UserFactory.create()
    const user2 = await UserFactory.apply('user').create()

    const newData = USER_EXAMPLE_DATA

    const response = await client
      .patch(`/users/` + user1.id)
      .loginAs(user2)
      .form(newData)

    response.assertStatus(403)
  })
})

test.group('User Novel Follows', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of followed novels', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/novels/followed').loginAs(user)

    // todo: detaylandirilacak

    response.assertStatus(200)
  })

  test('follow a novel', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const novel = await NovelFactory.create()

    await user.load('followNovels')

    assert.equal(user.followNovels.length, 0)

    const response = await client.put(`/novels/${novel.id}/follow`).loginAs(user)
    response.assertStatus(200)

    await user.load('followNovels')

    assert.equal(user.followNovels.length, 1)
    assert.equal(user.followNovels[0].id, novel.id)

    // o: cok guzel yazamadik olsun.
  })

  test('unfollow a novel', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const novel = await NovelFactory.create()

    user.related('followNovels').attach([novel.id])

    const response = await client.put(`/novels/${novel.id}/unfollow`).loginAs(user)
    response.assertStatus(200)

    await user.load('followNovels')

    assert.equal(user.followNovels.length, 0)
  })
})

test.group('User Like Follows', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of liked novels', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/novels/liked').loginAs(user)

    // todo: detaylandirilacak

    response.assertStatus(200)
  })

  test('like a novel', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const novel = await NovelFactory.create()

    await user.load('likeNovels')

    assert.equal(user.likeNovels.length, 0)

    const response = await client.put(`/novels/${novel.id}/like`).loginAs(user)
    response.assertStatus(200)

    await user.load('likeNovels')

    assert.equal(user.likeNovels.length, 1)
    assert.equal(user.likeNovels[0].id, novel.id)

    // o: cok guzel yazamadik olsun.
  })

  test('unlike a novel', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const novel = await NovelFactory.create()

    user.related('likeNovels').attach([novel.id])

    const response = await client.put(`/novels/${novel.id}/unlike`).loginAs(user)
    response.assertStatus(200)

    await user.load('likeNovels')

    assert.equal(user.likeNovels.length, 0)
  })
})
