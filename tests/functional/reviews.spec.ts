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
