import { test } from '@japa/runner'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import ChapterFactory from 'Database/factories/ChapterFactory'
import CommentFactory from 'Database/factories/CommentFactory'
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
    response.assertBodyContains(newData)
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
    response.assertBodyContains(newData)
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
    response.assertBodyContains(newData)
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

const NOVEL_COMMENT_EXAMPLE_DATA = {
  body: 'Yüce İblis Hükümdarı sen benim için çok önemlisin',
}

const NEW_NOVEL_COMMENT_EXAMPLE_DATA = {
  body: 'Yüce İblis Hükümdarı sen benim için artik hiç önemli değilsin',
}

test.group('Novel Comments', (group) => {
  group.each.setup(cleanAll)

  test('get a list of chapter comments for user', async ({ client }) => {
    const chapter = await ChapterFactory.create()
    const user = await UserFactory.create()

    const response = await client.get('/comments?chapter_id=' + chapter.id).loginAs(user)

    response.assertStatus(200)
  })

  test('create a chapter comment for user', async ({ client }) => {
    const chapter = await ChapterFactory.create()
    const user = await UserFactory.create()

    const data = {
      ...NOVEL_COMMENT_EXAMPLE_DATA,
      chapter_id: chapter.id,
    }

    const response = await client.post(`/comments/`).loginAs(user).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('update a chapter comment for user', async ({ client }) => {
    const user = await UserFactory.create()
    const comment = await CommentFactory.merge({
      user_id: user.id,
    }).create()

    const data = {
      ...NEW_NOVEL_COMMENT_EXAMPLE_DATA,
    }

    const response = await client.patch(`/comments/${comment.id}`).loginAs(user).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('delete a chapter comment for user', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const comment = await CommentFactory.merge({
      user_id: user.id,
    }).create()

    const response = await client.delete(`/comments/` + comment.id).loginAs(user)

    response.assertStatus(200)
  })

  test('user cannot update a comment', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const comment = await CommentFactory.create()

    const response = await client.patch(`/comments/` + comment.id).loginAs(user)

    response.assertStatus(403)
  })

  test('user cannot delete a comment', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const comment = await CommentFactory.create()

    const response = await client.delete(`/comments/` + comment.id).loginAs(user)

    response.assertStatus(403)
  })
})

test.group('Chapter Reads', (group) => {
  group.each.setup(cleanAll)

  test('read a chapter', async ({ assert, client }) => {
    const user = await UserFactory.create()
    await user.loadCount('readChapters')

    const prevReadChaptersCount = Number(user.$extras.readChapters_count)

    const chapter = await ChapterFactory.create()

    const response = await client.put(`/chapters/${chapter.id}/read`).loginAs(user)
    response.assertStatus(200)

    await user.loadCount('readChapters')

    const newReadChaptersCount = Number(user.$extras.readChapters_count)

    assert.equal(newReadChaptersCount, prevReadChaptersCount + 1)
  })

  test('unread a chapter', async ({ assert, client }) => {
    const chapter = await ChapterFactory.with('readUsers', 1).create()

    const user = chapter.readUsers[0]

    await user.loadCount('readChapters')

    const prevReadChaptersCount = Number(user.$extras.readChapters_count)

    const response = await client.put(`/chapters/${chapter.id}/unread`).loginAs(user)
    response.assertStatus(200)

    await user.loadCount('readChapters')

    const newReadChaptersCount = Number(user.$extras.readChapters_count)

    assert.equal(newReadChaptersCount, prevReadChaptersCount - 1)
  })
})
