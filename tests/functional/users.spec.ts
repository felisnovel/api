import Mail from '@ioc:Adonis/Addons/Mail'
import { test } from '@japa/runner'
import UserGender from 'App/Enums/UserGender'
import UserRole from 'App/Enums/UserRole'
import { appTitle } from 'Config/app'
import NovelFactory from 'Database/factories/NovelFactory'
import PromocodeFactory from 'Database/factories/PromocodeFactory'
import UserFactory from 'Database/factories/UserFactory'
import { addDays, format } from 'date-fns'
import { DateTime } from 'luxon'
import NotificationType from '../../app/Enums/NotificationType'
import OrderType from '../../app/Enums/OrderType'
import { cleanAll } from '../utils'

const USER_EXAMPLE_DATA = {
  full_name: 'Ahmet Mehmet',
  email: 'admin@felisnovel.com',
  username: 'admin',
  role: UserRole.ADMIN,
  bio: "I'm a bio",
  gender: UserGender.MALE,
  facebook_handle: 'facebook.com',
  twitter_handle: 'twitter.com',
  instagram_handle: 'instagram.com',
  youtube_handle: 'youtube.com',
  marketing_emails_enabled: true,
  subscriptions_emails_enabled: true,
  comments_emails_enabled: true,
  announcements_emails_enabled: true,
  events_emails_enabled: true,
}

const NEW_USER_EXAMPLE_DATA = {
  full_name: 'Yeni Ahmet Mehmet',
  email: 'yeniadmin@felisnovel.com',
  username: 'yeniadmin',
  role: UserRole.EDITOR,
  bio: "Yeni I'm a bio",
  gender: UserGender.FEMALE,
  facebook_handle: 'yeni.facebook.com',
  twitter_handle: 'yeni.twitter.com',
  instagram_handle: 'yeni.instagram.com',
  youtube_handle: 'yeni.youtube.com',
  marketing_emails_enabled: false,
  subscriptions_emails_enabled: false,
  comments_emails_enabled: false,
  announcements_emails_enabled: false,
  events_emails_enabled: false,
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

  /*
  // todo: fix this test

  test('check a user avatar', async ({ assert }) => {
    const user = await UserFactory.merge({
      email: 'alpidev9@gmail.com',
    }).create()

    assert.equal(user.avatar, '//www.gravatar.com/avatar/8b1a9953c4611296a827abf8c47804d7')
  })
  */

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
    const novel = await NovelFactory.with('user', 1).create()

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
    const novel = await NovelFactory.with('user', 1).create()

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
    const novel = await NovelFactory.with('user', 1).create()

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
    const novel = await NovelFactory.with('user', 1).create()

    user.related('likeNovels').attach([novel.id])

    const response = await client.put(`/novels/${novel.id}/unlike`).loginAs(user)
    response.assertStatus(200)

    await user.load('likeNovels')

    assert.equal(user.likeNovels.length, 0)
  })
})

test.group('User Favorites', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of user favorites', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get(`/user/favorites?username=${user.username}`)

    response.assertStatus(200)
  })

  test('favorite a novel', async ({ client }) => {
    const user = await UserFactory.create()
    const novel = await NovelFactory.with('user', 1).create()

    const data = {
      novel_id: novel.id,
      order: 1,
    }

    const response = await client.post(`/user/favorites`).loginAs(user).form(data)
    response.assertStatus(200)
  })

  test('unfavorite a novel', async ({ client }) => {
    const user = await UserFactory.with('favorites', 1, (favorite) => {
      favorite.with('user', 1).pivotAttributes({ order: 1 })
    }).create()

    const favorite = user.favorites[0]

    const response = await client.delete(`/user/favorites/${favorite.id}`).loginAs(user)
    response.assertStatus(200)
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
    const novel = await NovelFactory.with('user', 1).create()

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
    const novel = await NovelFactory.with('user', 1).create()

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
    const novel = await NovelFactory.with('user', 1).create()

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
    const novel = await NovelFactory.with('user', 1).create()

    user.related('likeNovels').attach([novel.id])

    const response = await client.put(`/novels/${novel.id}/unlike`).loginAs(user)
    response.assertStatus(200)

    await user.load('likeNovels')

    assert.equal(user.likeNovels.length, 0)
  })
})

const NEW_USER_DATA = {
  bio: 'new bio',
  email: 'newemail@gmail.com',
  gender: UserGender.OTHER,
}

const NEW_USER_PASSWORD_DATA = {
  password: 'NewPassword$123',
  password_confirmation: 'NewPassword$123',
}

test.group('User Actions', (group) => {
  group.each.setup(cleanAll)

  test('update user', async ({ assert, client }) => {
    const user = await UserFactory.merge({
      password: 'password',
    }).create()

    const firstResponse = await client.put(`/user/update`).loginAs(user).form(NEW_USER_DATA)
    firstResponse.assertBodyContains({
      message: 'E-posta adresini değiştirmek için mevcut şifrenizi girmelisiniz.',
    })

    const secondResponse = await client
      .put(`/user/update`)
      .loginAs(user)
      .form({
        ...NEW_USER_DATA,
        old_password: 'wrongpassword',
      })
    secondResponse.assertBodyContains({
      message: 'Mevcut şifreniz yanlış.',
    })

    const newData = {
      password: 'NewPassword$123',
      password_confirmation: 'NewPassword$123',
      old_password: 'password',
      ...NEW_USER_DATA,
    }

    const mailer = Mail.fake()

    const response = await client.put(`/user/update`).loginAs(user).form(newData)

    response.assertBodyContains(NEW_USER_DATA)
    response.assertStatus(200)

    await user.refresh()
    assert.equal(user.confirmedAt, null)

    assert.isTrue(mailer.exists({ subject: `${appTitle}: E-posta Adresini Onayla` }))

    Mail.restore()
  })

  test('update user password', async ({ assert, client }) => {
    const user = await UserFactory.merge({
      password: 'password',
      confirmedAt: DateTime.local(),
    }).create()

    const firstResponse = await client
      .put(`/user/update`)
      .loginAs(user)
      .form(NEW_USER_PASSWORD_DATA)

    firstResponse.assertBodyContains({
      message: 'Şifrenizi değiştirmek için mevcut şifrenizi girmelisiniz.',
    })

    const secondResponse = await client
      .put(`/user/update`)
      .loginAs(user)
      .form({
        ...NEW_USER_DATA,
        old_password: 'wrongpassword',
      })
    secondResponse.assertBodyContains({
      message: 'Mevcut şifreniz yanlış.',
    })

    const newData = {
      old_password: 'password',
      ...NEW_USER_PASSWORD_DATA,
    }

    const response = await client.put(`/user/update`).loginAs(user).form(newData)
    response.assertStatus(200)
  })
})

const ADD_COIN_DATA = {
  amount: 100,
  name: 'Hediye Coin',
}

test.group('User Coins', (group) => {
  group.each.setup(cleanAll)

  test('add coin to user', async ({ assert, client }) => {
    const admin = await UserFactory.apply('admin').create()
    const user = await UserFactory.create()

    const data = {
      type: OrderType.COIN,
      ...ADD_COIN_DATA,
    }

    const response = await client.put(`/users/${user.id}/add-coin`).loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)

    await user.refresh()
    assert.equal(user.coin_balance, ADD_COIN_DATA.amount)

    const responseNotificatons = await client.get('/notifications').loginAs(user)

    responseNotificatons.assertStatus(200)
    responseNotificatons.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.COIN,
          body: `Hesabınıza ${ADD_COIN_DATA.amount} pati yüklenmiştir.`,
        },
      ],
    })
  })

  test('add free coin to user', async ({ assert, client }) => {
    const admin = await UserFactory.apply('admin').create()
    const user = await UserFactory.create()

    const data = {
      type: OrderType.FREE,
      ...ADD_COIN_DATA,
    }

    const response = await client.put(`/users/${user.id}/add-coin`).loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)

    await user.refresh()
    assert.equal(user.free_balance, ADD_COIN_DATA.amount)

    const responseNotificatons = await client.get('/notifications').loginAs(user)

    responseNotificatons.assertStatus(200)
    responseNotificatons.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.FREE,
          body: `Hesabınıza ${ADD_COIN_DATA.amount} paticik yüklenmiştir.`,
        },
      ],
    })
  })
})

test.group('User Mute', (group) => {
  group.each.setup(cleanAll)

  test('mute user', async ({ assert, client }) => {
    const admin = await UserFactory.apply('admin').create()
    const user = await UserFactory.create()

    const dateFormat = 'yyyy-MM-dd HH:mm:ss'
    const mutedAt = addDays(new Date(), 10)
    const formatedMutedAt = format(mutedAt, dateFormat)

    const response = await client.put(`/users/${user.id}/mute-user`).loginAs(admin).form({
      muted_at: formatedMutedAt,
    })

    await user.refresh()

    response.assertStatus(204)

    assert.equal(user.mutedAt?.toFormat(dateFormat), formatedMutedAt)
  })

  test('unmute user', async ({ assert, client }) => {
    const admin = await UserFactory.apply('admin').create()
    const user = await UserFactory.apply('muted').create()

    const response = await client.put(`/users/${user.id}/unmute-user`).loginAs(admin)

    await user.refresh()

    response.assertStatus(204)

    assert.equal(user.mutedAt, null)
  })
})

test.group('User Promocode', (group) => {
  group.each.setup(cleanAll)

  test('use a promocode', async ({ assert, client }) => {
    const user = await UserFactory.create()
    const promocode = await PromocodeFactory.create()

    const data = {
      code: promocode.code,
    }

    const response = await client.put(`/user/use-promocode`).loginAs(user).form(data)

    response.assertStatus(200)

    await user.refresh()
    assert.equal(user.coin_balance, promocode.amount)
  })

  test('already use a promocode', async ({ client }) => {
    const user = await UserFactory.create()
    const promocode = await PromocodeFactory.with('orders', 1, function (orderFactory) {
      orderFactory.merge({
        user_id: user.id,
      })
    }).create()

    const data = {
      code: promocode.code,
    }

    const response = await client.put(`/user/use-promocode`).loginAs(user).form(data)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Bu promosyon kodunu daha önce kullanmışsınız.',
    })
  })

  test('use a promocode for limit ended', async ({ client }) => {
    const user = await UserFactory.create()
    const promocode = await PromocodeFactory.merge({
      limit: 10,
      used: 10,
    }).create()

    const data = {
      code: promocode.code,
    }

    const response = await client.put(`/user/use-promocode`).loginAs(user).form(data)

    response.assertStatus(400)
    response.assertBodyContains({
      message:
        'Bu promosyon kodunun kullanımı sona ermiştir veya yanlış promosyon kodu girmiş olabilirsiniz. Lütfen kodu kontrol ediniz.',
    })
  })
})
