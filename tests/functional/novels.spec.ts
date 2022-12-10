import { test } from '@japa/runner'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'
import { expect } from 'chai'
import ChapterFactory from 'Database/factories/ChapterFactory'
import CountryFactory from 'Database/factories/CountryFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import ReviewFactory from 'Database/factories/ReviewFactory'
import TagFactory from 'Database/factories/TagFactory'
import UserFactory from 'Database/factories/UserFactory'
import VolumeFactory from 'Database/factories/VolumeFactory'
import { cleanAll } from '../utils'

const NOVEL_EXAMPLE_DATA = {
  name: 'Yüce İblis Hükümdarı',
  shorthand: 'YIH',
  other_names: 'Yüce İblis Hükümdarı, The Great Demon Lord',
  image: 'https://i.imgur.com/1ZQZ1Zm.jpg',
  cover_image: 'https://i.imgur.com/1ZQZ1Zm.jpg',
  context: 'Yüce İblis Hükümdarı',
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
  coin_amount: 10,
  free_amount: 20,
}

const NEW_NOVEL_EXAMPLE_DATA = {
  name: 'yeniYüce İblis Hükümdarı',
  shorthand: 'YIM',
  other_names: 'yeniYüce İblis Hükümdarı, The Great Demon Lord',
  image: 'https://i.imgur.com/1ZQZ1Z3.jpg',
  cover_image: 'https://i.imgur.com/1ZQZ1Z3.jpg',
  context: 'yeniYüce İblis Hükümdarı',
  author: 'yeniİlker Yücel',
  license_holder: 'yeniİlker Yücel',
  status: NovelStatus.HIATUS,
  publish_status: NovelPublishStatus.PUBLISHED,
  translation_status: NovelTranslationStatus.DROPPED,
  is_mature: true,
  is_premium: true,
  is_promoted: true,
  editor: 'yeni İlker Yücel',
  translator: 'yeni İlker Yücel',
  coin_amount: 0,
  free_amount: 0,
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

  test('get a last updated novels for user', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get('/last-updated-novels').loginAs(user)

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
    const novel1 = await NovelFactory.with('user', 1)
      .merge({
        publish_status: NovelPublishStatus.PUBLISHED,
        name: 'Yüce İblis Hükümdarı',
      })
      .create()
    await NovelFactory.with('user', 1)
      .merge({
        publish_status: NovelPublishStatus.PUBLISHED,
      })
      .createMany(5)

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

    const { context, ...otherData } = data

    response.assertStatus(200)
    response.assertBodyContains({
      ...otherData,
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
    const novel = await NovelFactory.with('user', 1).apply('published').create()

    const response = await client.get(`/novels/${novel.id}`)

    response.assertStatus(200)
  })

  test('show a novel with slug', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1).apply('published').create()

    const response = await client.get(`/novels/${novel.slug}`)

    response.assertStatus(200)
  })

  test('show a unpublished novel for admin', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1).apply('unpublished').create()
    const admin = await UserFactory.apply('admin').create()

    const response = await client.get(`/novels/${novel.id}`).loginAs(admin)

    response.assertStatus(200)
  })

  test('show a unpublished novel for user', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1).apply('unpublished').create()
    const user = await UserFactory.apply('user').create()

    const response = await client.get(`/novels/${novel.id}`).loginAs(user)

    response.assertStatus(404)
  })

  test('show a novel for user with followed, liked', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1).apply('published').create()
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

  test('show a novel with volumes', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1).apply('published').create()
    await VolumeFactory.merge({ volume_novel_id: novel.id, volume_number: 1 })
      .apply('published')
      .create()
    await VolumeFactory.merge({ volume_novel_id: novel.id, volume_number: 2 })
      .apply('published')
      .create()
    await VolumeFactory.merge({
      volume_novel_id: novel.id,
      volume_number: 0,
      name: 'Yardımcı Cilt',
    })
      .apply('published')
      .create()
    await VolumeFactory.merge({ volume_novel_id: novel.id, volume_number: 3 })
      .apply('published')
      .create()
    await VolumeFactory.merge({ volume_novel_id: novel.id, volume_number: 4 })
      .apply('published')
      .create()

    const response = await client.get(`/novels/${novel.id}`)

    const volumes = (await response.body()).volumes

    response.assertStatus(200)

    expect(volumes[0].name).to.equal('Yardımcı Cilt')
    expect(volumes[1].volume_number).to.equal(4)
    expect(volumes[2].volume_number).to.equal(3)
    expect(volumes[3].volume_number).to.equal(2)
    expect(volumes[4].volume_number).to.equal(1)
  })

  test('update a novel', async ({ client }) => {
    const tags = await TagFactory.createMany(3)
    const novel = await NovelFactory.with('user', 1).create()
    const admin = await UserFactory.apply('admin').create()

    const newData = {
      ...NEW_NOVEL_EXAMPLE_DATA,
      tags: tags.map((tag) => tag.id),
    }

    const response = await client
      .patch(`/novels/` + novel.id)
      .loginAs(admin)
      .form(newData)

    const { context, ...otherNewData } = newData

    response.assertStatus(200)
    response.assertBodyContains({
      ...otherNewData,
      tags: tags.map((tag) => ({
        id: tag.id,
      })),
    })
  })

  test('update novel`s country', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const novel = await NovelFactory.with('user', 1).create()
    const newCountry = await CountryFactory.create()

    const newData = {
      ...NOVEL_EXAMPLE_DATA,
      country_id: newCountry.id,
    }

    const response = await client
      .patch(`/novels/` + novel.id)
      .loginAs(admin)
      .form(newData)

    const { context, ...otherNewData } = newData

    response.assertStatus(200)
    response.assertBodyContains(otherNewData)
  })

  test('user cannot update a novel', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1).create()
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
    const novel = await NovelFactory.with('user', 1).create()

    const response = await client.delete(`/novels/` + novel.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a novel', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const novel = await NovelFactory.with('user', 1).create()

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
    const novel = await NovelFactory.with('user', 1).create()
    const user = await UserFactory.create()

    const response = await client.get('/reviews?novel_id=' + novel.id).loginAs(user)

    response.assertStatus(200)
  })

  test('create a novel review for user', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1).create()
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
    const novel = await NovelFactory.with('user', 1).apply('published').with('volumes', 1).create()

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
