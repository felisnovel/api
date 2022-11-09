import { test } from '@japa/runner'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'
import NovelFactory from 'Database/factories/NovelFactory'
import UserFactory from 'Database/factories/UserFactory'
import VolumeFactory from 'Database/factories/VolumeFactory'
import { cleanAll } from '../utils'

const VOLUME_BASE_DATA = {
  volume_number: 1,
  publish_status: VolumePublishStatus.PUBLISHED,
}

const VOLUME_EXAMPLE_DATA = {
  ...VOLUME_BASE_DATA,
  name: 'Anne',
}

const VOLUME_NOT_NAME_EXAMPLE_DATA = {
  ...VOLUME_BASE_DATA,
  name: null,
}

test.group('Volumes', (group) => {
  group.each.setup(cleanAll)

  test('create a volume', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const novel = await NovelFactory.with('user', 1).create()

    const data = {
      volume_novel_id: novel.id,
      ...VOLUME_EXAMPLE_DATA,
    }

    const response = await client.post('/volumes').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('create a volume without name', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const novel = await NovelFactory.with('user', 1).create()

    const data = {
      volume_novel_id: novel.id,
      ...VOLUME_NOT_NAME_EXAMPLE_DATA,
    }

    const response = await client.post('/volumes').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('user cannot create a volume', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const novel = await NovelFactory.with('user', 1).create()

    const data = {
      volume_novel_id: novel.id,
      ...VOLUME_EXAMPLE_DATA,
    }

    const response = await client.post('/volumes').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('update a volume', async ({ client }) => {
    const volume = await VolumeFactory.with('novel', 1, function (novelFactory) {
      novelFactory.with('user', 1)
    }).create()
    const admin = await UserFactory.apply('admin').create()

    const newData = VOLUME_EXAMPLE_DATA

    const response = await client
      .patch(`/volumes/` + volume.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('update a volume without name', async ({ client }) => {
    const volume = await VolumeFactory.with('novel', 1, function (novelFactory) {
      novelFactory.with('user', 1)
    }).create()
    const admin = await UserFactory.apply('admin').create()

    const newData = VOLUME_NOT_NAME_EXAMPLE_DATA

    const response = await client
      .patch(`/volumes/` + volume.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('update volume`s novel', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const volume = await VolumeFactory.with('novel', 1, function (novelFactory) {
      novelFactory.with('user', 1)
    }).create()
    const newNovel = await NovelFactory.with('user', 1).create()

    const newData = {
      ...VOLUME_EXAMPLE_DATA,
      volume_novel_id: newNovel.id,
    }

    const response = await client
      .patch(`/volumes/` + volume.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('user cannot update a volume', async ({ client }) => {
    const volume = await VolumeFactory.with('novel', 1, function (novelFactory) {
      novelFactory.with('user', 1)
    }).create()
    const user = await UserFactory.apply('user').create()

    const newData = VOLUME_EXAMPLE_DATA

    const response = await client
      .patch(`/volumes/` + volume.id)
      .loginAs(user)
      .form(newData)

    response.assertStatus(403)
  })

  test('delete a volume', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const volume = await VolumeFactory.with('novel', 1, function (novelFactory) {
      novelFactory.with('user', 1)
    }).create()

    const response = await client.delete(`/volumes/` + volume.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a volume', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const volume = await VolumeFactory.with('novel', 1, function (novelFactory) {
      novelFactory.with('user', 1)
    }).create()

    const response = await client.delete(`/volumes/${volume.id}`).loginAs(user)

    response.assertStatus(403)
  })
})

test.group('Volume Chapters', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of chapters', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1).apply('published').create()
    const volumes = await VolumeFactory.apply('published')
      .merge({
        volume_novel_id: novel.id,
      })
      .with('chapters', 10, (chapterFactory) =>
        chapterFactory.apply('published').merge({
          novel_id: novel.id,
        })
      )
      .createMany(3)

    const response = await client.get(`/chapters?volume_id=${volumes[0].id}`)

    response.assertBodyContains({
      meta: {
        total: 10,
      },
    })
    response.assertStatus(200)
  })
})
