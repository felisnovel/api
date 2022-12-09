import { test } from '@japa/runner'
import ChapterFactory from 'Database/factories/ChapterFactory'
import CommentFactory from 'Database/factories/CommentFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import UserFactory from 'Database/factories/UserFactory'
import NotificationType from '../../app/Enums/NotificationType'
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

  test('get a paginated list of comments for user and is liked', async ({ client }) => {
    const user = await UserFactory.apply('admin').create()
    const comment = await CommentFactory.with('user', 1).create()

    await client.put(`/comments/${comment.id}/like`).loginAs(user)

    const response = await client.get('/comments').loginAs(user)

    response.assertBodyContains({
      data: [
        {
          is_liked: true,
        },
      ],
    })

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
    const comment = await CommentFactory.with('user', 1).create()

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

test.group('Comment Pinned', (group) => {
  group.each.setup(cleanAll)

  test('set pinned comment to true', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const comment = await CommentFactory.merge({
      is_pinned: false,
    }).create()

    const response = await client.put(`/comments/${comment.id}/set-pinned`).loginAs(admin).form({
      is_pinned: true,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      is_pinned: true,
    })
  })

  test('set pinned comment to false', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const comment = await CommentFactory.merge({
      is_pinned: true,
    }).create()

    const response = await client.put(`/comments/${comment.id}/set-pinned`).loginAs(admin).form({
      is_pinned: false,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      is_pinned: false,
    })
  })
})

test.group('Comment Report', (group) => {
  group.each.setup(cleanAll)

  test('create a report for comment', async ({ client }) => {
    const user = await UserFactory.create()
    const comment = await CommentFactory.create()

    const response = await client.put(`/comments/${comment.id}/report`).loginAs(user).form({
      body: 'This comment is offensive',
    })

    response.assertStatus(200)
  })
})

test.group('Comment Notification', (group) => {
  group.each.setup(cleanAll)

  test('like a comment', async ({ client }) => {
    const user = await UserFactory.create()
    const comment = await CommentFactory.with('user', 1).create()

    await client.put(`/comments/${comment.id}/like`).loginAs(user)

    const response = await client.get('/notifications').loginAs(comment.user)

    response.assertStatus(200)
    response.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.LIKE,
          title: `${user.username} yorumunu beğendi.`,
        },
      ],
    })
  })

  test('mention comment', async ({ client }) => {
    const user = await UserFactory.create()
    const mentionUser = await UserFactory.create()
    const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()
    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
    }).create()

    const comment = await CommentFactory.with('user', 1)
      .merge({
        chapter_id: chapter.id,
      })
      .create()

    await client
      .post(`/comments`)
      .form({
        body: `@${mentionUser.username} test`,
        parent_id: comment.id,
        chapter_id: comment.chapter_id,
      })
      .loginAs(user)

    const response = await client.get('/notifications').loginAs(comment.user)

    response.assertStatus(200)
    response.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.REPLY,
          title: `Yorumuna yanıt verildi.`,
        },
      ],
    })

    const responseMentionUser = await client.get('/notifications').loginAs(mentionUser)

    responseMentionUser.assertStatus(200)
    responseMentionUser.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.MENTION,
          title: `${user.username} yorumunda senden bahsetti.`,
        },
      ],
    })
  })
})

test.group('Comment Notification', (group) => {
  group.each.setup(cleanAll)

  test('like a comment', async ({ client }) => {
    const user = await UserFactory.create()
    const comment = await CommentFactory.with('user', 1).create()

    await client.put(`/comments/${comment.id}/like`).loginAs(user)

    const response = await client.get('/notifications').loginAs(comment.user)

    response.assertStatus(200)
    response.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.LIKE,
          body: `${user.username} yorumunu beğendi.`,
        },
      ],
    })
  })

  test('mention comment', async ({ client }) => {
    const user = await UserFactory.create()
    const mentionUser = await UserFactory.create()
    const novel = await NovelFactory.with('user', 1).with('volumes', 1).apply('published').create()
    const chapter = await ChapterFactory.merge({
      novel_id: novel.id,
      volume_id: novel.volumes[0].id,
    }).create()

    const comment = await CommentFactory.with('user', 1)
      .merge({
        chapter_id: chapter.id,
      })
      .create()

    await client
      .post(`/comments`)
      .form({
        body: `@${mentionUser.username} test`,
        parent_id: comment.id,
        chapter_id: comment.chapter_id,
      })
      .loginAs(user)

    const response = await client.get('/notifications').loginAs(comment.user)

    response.assertStatus(200)
    response.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.REPLY,
          body: `${user.username} yorumuna yanıt verdi`,
        },
      ],
    })

    const responseMentionUser = await client.get('/notifications').loginAs(mentionUser)

    responseMentionUser.assertStatus(200)
    responseMentionUser.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.MENTION,
          body: `${user.username} yorumunda senden bahsetti.`,
        },
      ],
    })
  })
})
