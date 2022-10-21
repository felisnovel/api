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

test.group('Comment Reactions', (group) => {
  group.each.setup(cleanAll)

  test('like a comment', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const comment = await CommentFactory.create()

    await user.loadCount('commentLikes')

    const prevCommentLikesCount = Number(user.$extras.commentLikes_count)

    const response = await client.put(`/comments/${comment.id}/like`).loginAs(user)

    await user.loadCount('commentLikes')

    const newCommentLikesCount = Number(user.$extras.commentLikes_count)

    assert.equal(prevCommentLikesCount + 1, newCommentLikesCount)

    response.assertStatus(200)
  })

  test('dislike a comment', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const comment = await CommentFactory.create()

    await user.loadCount('commentDislikes')

    const prevCommentDislikesCount = Number(user.$extras.commentDislikes_count)

    const response = await client.put(`/comments/${comment.id}/dislike`).loginAs(user)

    await user.loadCount('commentDislikes')

    const newCommentDislikesCount = Number(user.$extras.commentDislikes_count)

    assert.equal(prevCommentDislikesCount + 1, newCommentDislikesCount)

    response.assertStatus(200)
  })
})
