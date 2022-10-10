import { test } from '@japa/runner'
import CommentFactory from 'Database/factories/CommentFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const NEW_COMMENT_EXAMPLE_DATA = {
  body: 'Yüce İblis Hükümdarı sen benim için artik hiç önemli değilsin',
}

test.group('Comments', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of comments for admin', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const response = await client.get('/comments').loginAs(admin)

    response.assertStatus(200)
  })

  test('update a novel comment for admin', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const comment = await CommentFactory.create()

    const data = {
      ...NEW_COMMENT_EXAMPLE_DATA,
    }

    const response = await client.patch(`/comments/${comment.id}`).loginAs(admin).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('delete a novel comment for admin', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const comment = await CommentFactory.create()

    const response = await client.delete(`/comments/` + comment.id).loginAs(admin)

    response.assertStatus(200)
  })
})
