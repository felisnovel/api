import { test } from '@japa/runner'
import ReviewFactory from 'Database/factories/ReviewFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const NEW_REVIEW_EXAMPLE_DATA = {
  body: 'Yüce İblis Hükümdarı sen benim için artik hiç önemli değilsin',
}

test.group('Reviews', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of reviews for admin', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const response = await client.get('/reviews').loginAs(admin)

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

    const response = await client.delete(`/reviews/` + review.id).loginAs(admin)

    response.assertStatus(200)
  })
})

test.group('Review Reactions', (group) => {
  group.each.setup(cleanAll)

  test('like a review', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const review = await ReviewFactory.create()

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
