import { test } from '@japa/runner'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'
import NovelFactory from 'Database/factories/NovelFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const NOVEL_EXAMPLE_DATA = {
  name: 'Yüce İblis Hükümdarı',
  shorthand: 'YIH',
  image: 'https://i.imgur.com/1ZQZ1Zm.jpg',
  cover_image: 'https://i.imgur.com/1ZQZ1Zm.jpg',
  description: 'Yüce İblis Hükümdarı',
  author: 'İlker Yücel',
  license_holder: 'İlker Yücel',
  status: NovelStatus.COMPLETED,
  publish_status: NovelPublishStatus.DRAFT,
  translation_status: NovelTranslationStatus.COMPLETED,
  is_mature: false,
  is_premium: false,
  is_promoted: false,
}

test.group('Novels', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of novels', async ({ client }) => {
    const response = await client.get('/novels')

    response.assertStatus(200)
  })

  test('create a novel', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const data = NOVEL_EXAMPLE_DATA

    const response = await client.post('/novels').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('user cannot create a novel', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const data = NOVEL_EXAMPLE_DATA

    const response = await client.post('/novels').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('show a novel', async ({ client }) => {
    const novel = await NovelFactory.create()

    const response = await client.get(`/novels/` + novel.id)

    response.assertStatus(200)
  })

  test('update a novel', async ({ client }) => {
    const novel = await NovelFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = NOVEL_EXAMPLE_DATA

    const response = await client
      .patch(`/novels/` + novel.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('update novel`s editor', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const novel = await NovelFactory.create()
    const newEditor = await UserFactory.apply('editor').create()

    const newData = {
      ...NOVEL_EXAMPLE_DATA,
      editor_id: newEditor.id,
    }

    const response = await client
      .patch(`/novels/` + novel.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('update novel`s translator', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const novel = await NovelFactory.create()
    const newEditor = await UserFactory.apply('translator').create()

    const newData = {
      ...NOVEL_EXAMPLE_DATA,
      translator_id: newEditor.id,
    }

    const response = await client
      .patch(`/novels/` + novel.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('user cannot update a novel', async ({ client }) => {
    const novel = await NovelFactory.create()
    const user = await UserFactory.apply('user').create()

    const newData = NOVEL_EXAMPLE_DATA

    const response = await client
      .patch(`/novels/` + novel.id)
      .loginAs(user)
      .form(newData)

    response.assertStatus(403)
  })

  test('delete a novel', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const novel = await NovelFactory.create()

    const response = await client.delete(`/novels/` + novel.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a novel', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const novel = await NovelFactory.create()

    const response = await client.delete(`/novels/` + novel.id).loginAs(user)

    response.assertStatus(403)
  })
})
