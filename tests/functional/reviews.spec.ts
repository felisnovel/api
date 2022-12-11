import { test } from '@japa/runner'
import DateFormat from 'App/constants/DateFormat'
import NovelFactory from 'Database/factories/NovelFactory'
import ReviewFactory from 'Database/factories/ReviewFactory'
import UserFactory from 'Database/factories/UserFactory'
import { format } from 'date-fns'
import NotificationType from '../../app/Enums/NotificationType'
import { cleanAll } from '../utils'

const NEW_REVIEW_EXAMPLE_DATA = {
  body: 'Yüce İblis Hükümdarı sen benim için artik hiç önemli değilsin',
}

test.group('Reviews', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of reviews for user', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const response = await client.get('/reviews').loginAs(user)

    response.assertStatus(200)
  })

  test('get a paginated list of reviews for user and is liked', async ({ client }) => {
    const user = await UserFactory.apply('admin').create()
    const review = await ReviewFactory.with('user', 1)
      .with('novel', 1, (novelFactory) => {
        novelFactory.with('user', 1)
      })
      .create()

    await client.put(`/reviews/${review.id}/like`).loginAs(user)

    const response = await client.get('/reviews').loginAs(user)

    response.assertBodyContains({
      data: [
        {
          is_liked: true,
        },
      ],
    })

    response.assertStatus(200)
  })

  test('update a novel review for admin', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const review = await ReviewFactory.create()

    const data = {
      ...NEW_REVIEW_EXAMPLE_DATA,
    }

    const response = await client.patch(`/reviews/${review.id}`).loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('delete a novel review for admin', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const review = await ReviewFactory.create()

    const response = await client.delete(`/reviews/${review.id}`).loginAs(admin)

    response.assertStatus(200)
  })
})

test.group('Review Mute', (group) => {
  group.each.setup(cleanAll)

  test('if user muted should not create review', async ({ client }) => {
    await UserFactory.apply('editor').create()
    const mutedUser = await UserFactory.apply('muted').create()
    const novel = await NovelFactory.with('user', 1).apply('published').create()

    const response = await client
      .post('/reviews')
      .form({
        body: `foo`,
        novel_id: novel.id,
      })
      .loginAs(mutedUser)

    response.assertBodyContains({
      status: 'failure',
      message: `Belirtilen tarihe kadar inceleme yapamazsınız. (${format(
        mutedUser.mutedAt!.toJSDate(),
        DateFormat
      )})`,
    })

    response.assertStatus(401)
  })

  test('if user muted should not update review', async ({ client }) => {
    const mutedUser = await UserFactory.apply('muted').create()
    const review = await ReviewFactory.with('user', 1)
      .with('novel', 1, (novelFactory) => {
        novelFactory.with('user', 1)
      })
      .create()

    const response = await client
      .put(`/reviews/${review.id}`)
      .form({
        body: `foo`,
      })
      .loginAs(mutedUser)

    response.assertBodyContains({
      status: 'failure',
      message: `Belirtilen tarihe kadar inceleme güncelleyemezsiniz. (${format(
        mutedUser.mutedAt!.toJSDate(),
        DateFormat
      )})`,
    })

    response.assertStatus(401)
  })

  test('if user muted should not delete review', async ({ client }) => {
    const mutedUser = await UserFactory.apply('muted').create()
    const review = await ReviewFactory.with('user', 1)
      .with('novel', 1, (novelFactory) => {
        novelFactory.with('user', 1)
      })
      .create()

    const response = await client.delete(`/reviews/${review.id}`).loginAs(mutedUser)

    response.assertBodyContains({
      status: 'failure',
      message: `Belirtilen tarihe kadar inceleme silemezsiniz. (${format(
        mutedUser.mutedAt!.toJSDate(),
        DateFormat
      )})`,
    })

    response.assertStatus(401)
  })
})

test.group('Review Reactions', (group) => {
  group.each.setup(cleanAll)

  test('like a review', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const review = await ReviewFactory.with('user', 1)
      .with('novel', 1, (novelFactory) => {
        novelFactory.with('user', 1)
      })
      .create()

    await user.loadCount('reviewLikes')

    const prevReviewLikesCount = Number(user.$extras.reviewLikes_count)

    const response = await client.put(`/reviews/${review.id}/like`).loginAs(user)

    await user.loadCount('reviewLikes')

    const newReviewLikesCount = Number(user.$extras.reviewLikes_count)

    assert.equal(prevReviewLikesCount + 1, newReviewLikesCount)

    response.assertStatus(200)
  })

  test('dislike a review', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const review = await ReviewFactory.create()

    await user.loadCount('reviewDislikes')

    const prevReviewDislikesCount = Number(user.$extras.reviewDislikes_count)

    const response = await client.put(`/reviews/${review.id}/dislike`).loginAs(user)

    await user.loadCount('reviewDislikes')

    const newReviewDislikesCount = Number(user.$extras.reviewDislikes_count)

    assert.equal(prevReviewDislikesCount + 1, newReviewDislikesCount)

    response.assertStatus(200)
  })

  test('like and dislike a review', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const review = await ReviewFactory.with('user', 1)
      .with('novel', 1, (novelFactory) => {
        novelFactory.with('user', 1)
      })
      .create()

    await client.put(`/reviews/${review.id}/like`).loginAs(user)
    const response = await client.put(`/reviews/${review.id}/dislike`).loginAs(user)

    await user.loadCount('reviewLikes')

    const reviewLikesCount = Number(user.$extras.reviewLikes_count)

    assert.equal(reviewLikesCount, 0)

    response.assertStatus(200)
  })
})

test.group('Review Pinned', (group) => {
  group.each.setup(cleanAll)

  test('set pinned review to true', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const review = await ReviewFactory.merge({
      is_pinned: false,
    }).create()

    const response = await client.put(`/reviews/${review.id}/set-pinned`).loginAs(admin).form({
      is_pinned: true,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      is_pinned: true,
    })
  })

  test('set pinned review to false', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const review = await ReviewFactory.merge({
      is_pinned: true,
    }).create()

    const response = await client.put(`/reviews/${review.id}/set-pinned`).loginAs(admin).form({
      is_pinned: false,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      is_pinned: false,
    })
  })
})

test.group('Review Report', (group) => {
  group.each.setup(cleanAll)

  test('create a report for comment', async ({ client }) => {
    const user = await UserFactory.create()
    const review = await ReviewFactory.create()

    const response = await client.put(`/reviews/${review.id}/report`).loginAs(user).form({
      body: 'This comment is offensive',
    })

    response.assertStatus(200)
  })
})

test.group('Review Notification', (group) => {
  group.each.setup(cleanAll)

  test('like a review', async ({ client }) => {
    const user = await UserFactory.create()
    const review = await ReviewFactory.with('user', 1)
      .with('novel', 1, (novelFactory) => {
        novelFactory.with('user', 1)
      })
      .create()

    await client.put(`/reviews/${review.id}/like`).loginAs(user)

    const response = await client.get('/notifications').loginAs(review.user)

    response.assertStatus(200)
    response.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.LIKE,
          body: `${user.username} incelemeni beğendi.`,
        },
      ],
    })
  })

  test('mention review', async ({ client }) => {
    const user = await UserFactory.create()
    const mentionUser = await UserFactory.create()
    const novel = await NovelFactory.with('user', 1).apply('published').create()

    const review = await ReviewFactory.with('user', 1)
      .merge({
        novel_id: novel.id,
      })
      .create()

    await client
      .post(`/reviews`)
      .form({
        body: `@${mentionUser.username} test`,
        novel_id: review.novel_id,
      })
      .loginAs(user)

    const response = await client.get('/notifications').loginAs(mentionUser)

    response.assertStatus(200)
    response.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.MENTION,
          body: `${user.username} incelemesinde senden bahsetti.`,
        },
      ],
    })
  })
})
