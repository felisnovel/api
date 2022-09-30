import { test } from '@japa/runner'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import ChapterFactory from 'Database/factories/ChapterFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import UserFactory from 'Database/factories/UserFactory'
import VolumeFactory from 'Database/factories/VolumeFactory'
import { cleanAll } from '../utils'

const CHAPTER_EXAMPLE_DATA = {
  title: 'Cehennem Melekleri',
  number: 1,
  context: 'https://i.imgur.com/1ZQZ1Zm.jpg',
  translation_note: 'Yüce İblis Hükümdarı',
  is_mature: false,
  is_premium: false,
  publish_status: ChapterPublishStatus.DRAFT,
}

test.group('Chapters', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of chapters', async ({ client }) => {
    const response = await client.get('/chapters')

    response.assertStatus(200)
  })

  test('create a chapter', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const data = CHAPTER_EXAMPLE_DATA

    const response = await client.post('/chapters').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('user cannot create a chapter', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const data = CHAPTER_EXAMPLE_DATA

    const response = await client.post('/chapters').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('show a chapter', async ({ client }) => {
    const chapter = await ChapterFactory.create()

    const response = await client.get(`/chapters/` + chapter.id)

    response.assertStatus(200)
  })

  test('update a chapter', async ({ client }) => {
    const chapter = await ChapterFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = CHAPTER_EXAMPLE_DATA

    const response = await client
      .patch(`/chapters/` + chapter.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains({
      id: chapter.id,
      ...newData,
    })
  })

  test('update chapter`s novel', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const chapter = await ChapterFactory.create()
    const newNovel = await NovelFactory.create()

    const newData = {
      ...CHAPTER_EXAMPLE_DATA,
      novel_id: newNovel.id,
    }

    const response = await client
      .patch(`/chapters/` + chapter.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains({
      id: chapter.id,
      ...newData,
    })
  })

  test('update chapter`s volume', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const chapter = await ChapterFactory.create()
    const newVolume = await VolumeFactory.create()

    const newData = {
      ...CHAPTER_EXAMPLE_DATA,
      volume_id: newVolume.id,
    }

    const response = await client
      .patch(`/chapters/` + chapter.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains({
      id: chapter.id,
      ...newData,
    })
  })

  test('user cannot update a chapter', async ({ client }) => {
    const chapter = await ChapterFactory.create()
    const user = await UserFactory.apply('user').create()

    const newData = CHAPTER_EXAMPLE_DATA

    const response = await client
      .patch(`/chapters/` + chapter.id)
      .loginAs(user)
      .form(newData)

    response.assertStatus(403)
  })

  test('delete a chapter', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const chapter = await ChapterFactory.create()

    const response = await client.delete(`/chapters/` + chapter.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a chapter', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const chapter = await ChapterFactory.create()

    const response = await client.delete(`/chapters/` + chapter.id).loginAs(user)

    response.assertStatus(403)
  })
})
