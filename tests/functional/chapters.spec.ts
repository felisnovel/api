import { test } from '@japa/runner'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'
import ChapterFactory from 'Database/factories/ChapterFactory'
import CommentFactory from 'Database/factories/CommentFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import PlanFactory from 'Database/factories/PlanFactory'
import UserFactory from 'Database/factories/UserFactory'
import VolumeFactory from 'Database/factories/VolumeFactory'
import NotificationType from '../../app/Enums/NotificationType'
import OrderType from '../../app/Enums/OrderType'
import { cleanAll } from '../utils'

const CHAPTER_EXAMPLE_DATA = {
  title: 'Cehennem Melekleri',
  number: 1,
  context: 'https://i.imgur.com/1ZQZ1Zm.jpg',
  translation_note: 'Yüce İblis Hükümdarı',
  is_mature: false,
  is_premium: false,
  publish_status: ChapterPublishStatus.DRAFT,
  editor: 'Yüce İblis Hükümdarı',
  translator: 'Yüce İblis Hükümdarı',
}

const NEW_CHAPTER_EXAMPLE_DATA = {
  title: 'yeniCehennem Melekleri',
  number: 2,
  context: 'https://i.imgur.com/1ZQZ1Zm.jpg',
  translation_note: 'yeniYüce İblis Hükümdarı',
  is_mature: true,
  is_premium: true,
  publish_status: ChapterPublishStatus.PUBLISHED,
  editor: 'yeni Yüce İblis Hükümdarı',
  translator: 'yeni Yüce İblis Hükümdarı',
}

test.group('Chapters', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of chapters', async ({ client }) => {
    const response = await client.get('/chapters')

    response.assertStatus(200)
  })

  test('create a chapter', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()

    const data = {
      ...CHAPTER_EXAMPLE_DATA,
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
    }

    const response = await client.post('/chapters').loginAs(admin).form(data)

    const { context, translation_note, ...otherData } = data

    response.assertStatus(200)
    response.assertBodyContains(otherData)
  })

  test('user cannot create a chapter', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const data = CHAPTER_EXAMPLE_DATA

    const response = await client.post('/chapters').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('show a chapter', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1)
      .apply('published')
      .with('volumes', 1, (volumeFactory) => {
        volumeFactory.apply('published')
      })
      .merge({
        is_premium: false,
      })
      .create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
      translation_note: '*test*',
      context: '*test*',
      is_premium: false,
    })
      .apply('published')
      .create()

    const response = await client.get(
      `/chapters/${chapter.number}?novel=${novel.slug}&shorthand=${novel.shorthand}`
    )

    response.assertStatus(200)
    response.assertBodyContains({
      translation_note: '<p><em>test</em></p>',
      body: '<p><em>test</em></p>',
    })
  })

  test('show a chapter for md', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const novel = await NovelFactory.with('user', 1)
      .apply('published')
      .with('volumes', 1, (volumeFactory) => {
        volumeFactory.apply('published')
      })
      .create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
      translation_note: '*test*',
      context: '*test*',
    })
      .apply('published')
      .create()

    const response = await client
      .get(`/chapters/${chapter.number}?novel=${novel.slug}&shorthand=${novel.shorthand}&md=true`)
      .loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      translation_note: '*test*',
      context: '*test*',
    })
  })

  test('update a chapter', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
    }).create()

    const admin = await UserFactory.apply('admin').create()

    const newData = NEW_CHAPTER_EXAMPLE_DATA

    const response = await client
      .patch(`/chapters/` + chapter.id)
      .loginAs(admin)
      .form(newData)

    const { context, translation_note, ...otherNewData } = newData

    response.assertStatus(200)
    response.assertBodyContains(otherNewData)
  })

  test('update chapter`s novel', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
    }).create()

    const newNovel = await NovelFactory.with('user', 1).create()

    const newData = {
      ...CHAPTER_EXAMPLE_DATA,
      novel_id: newNovel.id,
    }

    const response = await client
      .patch(`/chapters/` + chapter.id)
      .loginAs(admin)
      .form(newData)

    const { context, translation_note, ...otherNewData } = newData

    response.assertStatus(200)
    response.assertBodyContains(otherNewData)
  })

  test('update chapter`s volume', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
    }).create()

    const newVolume = await VolumeFactory.merge({
      volume_novel_id: novel.id,
    }).create()

    const newData = {
      ...CHAPTER_EXAMPLE_DATA,
      volume_id: newVolume.id,
    }

    const response = await client
      .patch(`/chapters/` + chapter.id)
      .loginAs(admin)
      .form(newData)

    const { context, translation_note, ...otherNewData } = newData

    response.assertStatus(200)
    response.assertBodyContains(otherNewData)
  })

  test('user cannot update a chapter', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
    }).create()

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

    const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
    }).create()

    const response = await client.delete(`/chapters/` + chapter.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a chapter', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
    }).create()

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
    const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
    }).create()

    const user = await UserFactory.create()

    const response = await client.get('/comments?chapter_id=' + chapter.id).loginAs(user)

    response.assertStatus(200)
  })

  test('create a chapter comment for user', async ({ client }) => {
    const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
    }).create()

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

    const novel = await NovelFactory.with('user', 1)
      .with('volumes', 1)
      .merge({
        is_premium: false,
      })
      .apply('published')
      .create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
      is_premium: false,
    })
      .apply('published')
      .create()

    const response = await client.put(`/chapters/${chapter.id}/read`).loginAs(user)
    response.assertStatus(200)

    await user.loadCount('readChapters')

    const newReadChaptersCount = Number(user.$extras.readChapters_count)

    assert.equal(newReadChaptersCount, prevReadChaptersCount + 1)
  })

  test('unread a chapter', async ({ assert, client }) => {
    const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()

    const chapter = await ChapterFactory.with('readUsers', 1)
      .merge({
        novel_id: novel.id,
        volume_id: novel.volumes[0].id,
      })
      .create()

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

test.group('Chapter Premium', (group) => {
  group.each.setup(cleanAll)

  test('purchase a chapter', async ({ assert, client }) => {
    const user = await UserFactory.with('orders', 1, function (orderFactory) {
      return orderFactory.merge({
        type: OrderType.COIN,
        amount: 100,
        is_paid: true,
      })
    }).create()

    await user.loadCount('purchasedChapters')

    const prevPurchasedChaptersCount = Number(user.$extras.purchasedChapters_count)

    const novel = await NovelFactory.with('user', 1)
      .with('volumes', 1)
      .merge({
        is_premium: true,
        free_amount: 10,
        coin_amount: 5,
      })
      .create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
      is_premium: true,
    }).create()

    const response = await client.put(`/chapters/${chapter.id}/purchase`).loginAs(user)
    response.assertStatus(200)

    await user.loadCount('purchasedChapters')

    const newPurchasedChaptersCount = Number(user.$extras.purchasedChapters_count)

    assert.equal(newPurchasedChaptersCount, prevPurchasedChaptersCount + 1)
  })

  test('purchase a chapter for free coin', async ({ assert, client }) => {
    const novel = await NovelFactory.with('user', 1)
      .merge({
        is_premium: true,
        free_amount: 10,
        coin_amount: 5,
      })
      .apply('published')
      .create()

    const volume1 = await VolumeFactory.merge({
      publish_status: VolumePublishStatus.PUBLISHED,
      volume_novel_id: novel.id,
      volume_number: 1,
    }).create()

    const volume2 = await VolumeFactory.merge({
      publish_status: VolumePublishStatus.PUBLISHED,
      volume_novel_id: novel.id,
      volume_number: 2,
    }).create()

    const defaultChapterAttributes = {
      publish_status: ChapterPublishStatus.PUBLISHED,
      novel_id: novel.id,
      is_premium: true,
    }

    const defaultChapterForVolume1Attributes = {
      ...defaultChapterAttributes,
      volume_id: volume1.id,
    }

    const defaultChapterForVolume2Attributes = {
      ...defaultChapterAttributes,
      volume_id: volume2.id,
    }

    const chapter1 = await ChapterFactory.merge({
      number: 1,
      ...defaultChapterForVolume1Attributes,
    }).create()

    const chapter2 = await ChapterFactory.merge({
      number: 2,
      ...defaultChapterForVolume1Attributes,
    }).create()

    const chapter3 = await ChapterFactory.merge({
      number: 3,
      ...defaultChapterForVolume2Attributes,
    }).create()

    const user = await UserFactory.with('orders', 1, function (orderFactory) {
      return orderFactory.merge({
        type: OrderType.FREE,
        amount: 100,
        is_paid: true,
      })
    }).create()

    const responseForBuyChapter3 = await client
      .put(`/chapters/${chapter3.id}/purchase?buy_type=free`)
      .loginAs(user)
    await responseForBuyChapter3.assertBodyContains({
      message:
        'Paticik kullanarak sadece sırayla bölüm açabilirsiniz. Lütfen açmadığınız ilk bölümden açmaya başlayınız.',
    })

    const responseForBuyChapter1 = await client
      .put(`/chapters/${chapter1.id}/purchase?buy_type=free`)
      .loginAs(user)
    await responseForBuyChapter1.assertStatus(200)

    const responseForBuyChapter2 = await client
      .put(`/chapters/${chapter2.id}/purchase?buy_type=free`)
      .loginAs(user)
    await responseForBuyChapter2.assertStatus(200)
  })

  test('show a purchased chapter for user', async ({ client }) => {
    const user = await UserFactory.with('orders', 1, function (orderFactory) {
      return orderFactory.merge({
        type: OrderType.COIN,
        amount: 100,
        is_paid: true,
      })
    }).create()

    await user.loadCount('purchasedChapters')

    const novel = await NovelFactory.with('user', 1)
      .with('volumes', 1, function (volumeFactory) {
        volumeFactory.apply('published')
      })
      .merge({
        is_premium: true,
      })
      .apply('published')
      .create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
      is_premium: true,
    })
      .apply('published')
      .create()

    const responseIsNotPurchased = await client
      .get(`/chapters/${chapter.number}?novel=${novel.slug}&shorthand=${novel.shorthand}`)
      .loginAs(user)

    responseIsNotPurchased.assertStatus(200)
    responseIsNotPurchased.assertBodyContains({
      is_opened: false,
    })

    await client.put(`/chapters/${chapter.id}/purchase`).loginAs(user)

    const responseIsPurchased = await client
      .get(`/chapters/${chapter.number}?novel=${novel.slug}&shorthand=${novel.shorthand}`)
      .loginAs(user)

    responseIsPurchased.assertStatus(200)
    responseIsPurchased.assertBodyContains({
      is_opened: true,
    })
  })

  test('show a chapter plan for user', async ({ client }) => {
    const user = await UserFactory.with('orders', 1, function (orderFactory) {
      return orderFactory.merge({
        type: OrderType.COIN,
        amount: 100,
        is_paid: true,
      })
    }).create()

    await user.loadCount('subscribedPlans')

    const novel = await NovelFactory.with('user', 1)
      .with('volumes', 1, function (volumeFactory) {
        volumeFactory.apply('published')
      })
      .merge({
        is_premium: true,
      })
      .apply('published')
      .create()

    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
      is_premium: true,
    })
      .apply('published')
      .create()

    const responseIsNotPurchased = await client
      .get(`/chapters/${chapter.number}?novel=${novel.slug}&shorthand=${novel.shorthand}`)
      .loginAs(user)

    responseIsNotPurchased.assertStatus(200)
    responseIsNotPurchased.assertBodyContains({
      is_opened: false,
      body: `<p>${chapter.context.slice(0, 200)}</p>`,
    })

    const plan = await PlanFactory.merge({
      premium_eps: true,
    }).create()

    await client.put(`/plans/${plan.id}/subscribe`).loginAs(user)

    const responseIsSubscribed = await client
      .get(`/chapters/${chapter.number}?novel=${novel.slug}&shorthand=${novel.shorthand}`)
      .loginAs(user)

    responseIsSubscribed.assertStatus(200)
    responseIsSubscribed.assertBodyContains({
      is_opened: true,
      body: '<p>' + chapter.context + '</p>',
    })
  })
})

test.group('Chapter Notification', (group) => {
  group.each.setup(cleanAll)

  test('new chapter notification', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const novel = await NovelFactory.with('user', 1)
      .with('volumes', 1)
      .with('followers', 1)
      .create()

    const data = {
      ...CHAPTER_EXAMPLE_DATA,
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
      publish_status: ChapterPublishStatus.PUBLISHED,
    }

    const responseChapter = await client.post('/chapters').loginAs(admin).form(data)

    const chapterFullName = (await responseChapter.body()).name

    const response = await client.get('/notifications').loginAs(novel.followers[0])

    response.assertStatus(200)
    response.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.FOLLOW,
          body: `${chapterFullName} eklendi.`,
        },
      ],
    })
  })
})
