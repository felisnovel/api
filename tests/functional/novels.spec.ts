import { test } from '@japa/runner'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'
import ChapterFactory from 'Database/factories/ChapterFactory'
import CountryFactory from 'Database/factories/CountryFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import ReviewFactory from 'Database/factories/ReviewFactory'
import TagFactory from 'Database/factories/TagFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const NOVEL_EXAMPLE_DATA = {
  name: 'Yüce İblis Hükümdarı',
  shorthand: 'YIH',
  other_names: 'Yüce İblis Hükümdarı, The Great Demon Lord',
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
  editor: 'İlker Yücel',
  translator: 'İlker Yücel',
}

test.group('Novels', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of novels', async ({ client }) => {
    const response = await client.get('/novels')

    response.assertStatus(200)
  })

  test('get a promoted novels for admin', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.get('/promoted-novels').loginAs(admin)

    response.assertStatus(200)
  })

  test('get a last updated novels for admin', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.get('/last-updated-novels').loginAs(admin)

    response.assertStatus(200)
  })

  test('get a popular novels for admin', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.get('/popular-novels').loginAs(admin)

    response.assertStatus(200)
  })

  test('get a last novels for admin', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.get('/last-novels').loginAs(admin)

    response.assertStatus(200)
  })

  test('get a random novels for admin', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.get('/random-novels').loginAs(admin)

    response.assertStatus(200)
  })

  test('get a paginated list of novels for filter', async ({ assert, client }) => {
    const novel1 = await NovelFactory.merge({
      publish_status: NovelPublishStatus.PUBLISHED,
      name: 'Yüce İblis Hükümdarı',
    }).create()
    await NovelFactory.merge({
      publish_status: NovelPublishStatus.PUBLISHED,
    }).createMany(5)

    const response = await client.get('/novels?filter=Yüce')

    assert.equal(response.response.body.meta.total, 1)
    response.assertBodyContains({
      data: [
        {
          id: novel1.id,
        },
      ],
    })
    response.assertStatus(200)
  })

  test('create a novel', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const tags = await TagFactory.createMany(3)

    const data = { ...NOVEL_EXAMPLE_DATA, tags: tags.map((tag) => tag.id) }

    const response = await client.post('/novels').loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains({
      ...data,
      tags: tags.map((tag) => ({
        id: tag.id,
      })),
    })
  })

  test('user cannot create a novel', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const data = NOVEL_EXAMPLE_DATA

    const response = await client.post('/novels').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('show a novel with id', async ({ client }) => {
    const novel = await NovelFactory.apply('published').create()

    const response = await client.get(`/novels/${novel.id}`)

    response.assertStatus(200)
  })

  test('show a novel with slug', async ({ client }) => {
    const novel = await NovelFactory.apply('published').create()

    const response = await client.get(`/novels/${novel.slug}`)

    response.assertStatus(200)
  })

  test('show a unpublished novel for admin', async ({ client }) => {
    const novel = await NovelFactory.apply('unpublished').create()
    const admin = await UserFactory.apply('admin').create()

    const response = await client.get(`/novels/${novel.id}`).loginAs(admin)

    response.assertStatus(200)
  })

  test('show a unpublished novel for user', async ({ client }) => {
    const novel = await NovelFactory.apply('unpublished').create()
    const user = await UserFactory.apply('user').create()

    const response = await client.get(`/novels/${novel.id}`).loginAs(user)

    response.assertStatus(404)
  })

  test('show a novel for user with followed, liked', async ({ client }) => {
    const novel = await NovelFactory.apply('published').create()
    const user = await UserFactory.create()

    const firstResponse = await client.get(`/novels/${novel.id}`).loginAs(user)
    firstResponse.assertBodyContains({
      is_liked: false,
      is_followed: false,
    })
    firstResponse.assertStatus(200)

    await user.related('likeNovels').sync([novel.id], false)
    await user.related('followNovels').sync([novel.id], false)

    const secondResponse = await client.get(`/novels/${novel.id}`).loginAs(user)
    secondResponse.assertBodyContains({
      is_liked: true,
      is_followed: true,
    })
    secondResponse.assertStatus(200)
  })

  test('update a novel', async ({ client }) => {
    const tags = await TagFactory.createMany(3)
    const novel = await NovelFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = {
      ...NOVEL_EXAMPLE_DATA,
      tags: tags.map((tag) => tag.id),
    }

    const response = await client
      .patch(`/novels/` + novel.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains({
      ...newData,
      tags: tags.map((tag) => ({
        id: tag.id,
      })),
    })
  })

  test('update novel`s country', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const novel = await NovelFactory.create()
    const newCountry = await CountryFactory.create()

    const newData = {
      ...NOVEL_EXAMPLE_DATA,
      country_id: newCountry.id,
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

const NOVEL_REVIEW_EXAMPLE_DATA = {
  body: 'Yüce İblis Hükümdarı sen benim için çok önemlisin',
}

const NEW_NOVEL_REVIEW_EXAMPLE_DATA = {
  body: 'Yüce İblis Hükümdarı sen benim için artik hiç önemli değilsin',
}

test.group('Novel Reviews', (group) => {
  group.each.setup(cleanAll)

  test('get a list of novel reviews for user', async ({ client }) => {
    const novel = await NovelFactory.create()
    const user = await UserFactory.create()

    const response = await client.get('/reviews?novel_id=' + novel.id).loginAs(user)

    response.assertStatus(200)
  })

  test('create a novel review for user', async ({ client }) => {
    const novel = await NovelFactory.create()
    const user = await UserFactory.create()

    const data = {
      ...NOVEL_REVIEW_EXAMPLE_DATA,
      novel_id: novel.id,
    }

    const response = await client.post(`/reviews/`).loginAs(user).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('update a novel review for user', async ({ client }) => {
    const user = await UserFactory.create()
    const review = await ReviewFactory.merge({
      user_id: user.id,
    }).create()

    const data = {
      ...NEW_NOVEL_REVIEW_EXAMPLE_DATA,
    }

    const response = await client.patch(`/reviews/${review.id}`).loginAs(user).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('delete a novel review for user', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const review = await ReviewFactory.merge({
      user_id: user.id,
    }).create()

    const response = await client.delete(`/reviews/${review.id}`).loginAs(user)

    response.assertStatus(200)
  })

  test('user cannot update a review', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const review = await ReviewFactory.create()

    const response = await client.patch(`/reviews/${review.id}`).loginAs(user)

    response.assertStatus(403)
  })

  test('user cannot delete a review', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const review = await ReviewFactory.create()

    const response = await client.delete(`/reviews/${review.id}`).loginAs(user)

    response.assertStatus(403)
  })
})

test.group('Novel Read Chapters', (group) => {
  group.each.setup(cleanAll)

  test('check latest read chapter', async ({ client }) => {
    const novel = await NovelFactory.apply('published').with('volumes', 1).create()

    const chapter = await ChapterFactory.with('readUsers', 1)
      .merge({
        novel_id: novel.id,
        volume_id: novel.volumes[0].id,
      })
      .create()

    const user = chapter.readUsers[0]

    const response = await client.get(`/novels/${novel.id}`).loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({
      latest_read_chapter: {
        id: chapter.id,
      },
    })
  })
})
