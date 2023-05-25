import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DateFormat from 'App/constants/DateFormat'
import Chapter from 'App/Models/Chapter'
import Comment from 'App/Models/Comment'
import UpdateCommentRequestValidator from 'App/Validators/UpdateCommentRequestValidator'
import { format } from 'date-fns'
import NotificationService from '../../Services/NotificationService'
import CreateCommentRequestValidator from '../../Validators/CreateCommentRequestValidator'

export default class CommentController {
  async index({ response, auth, request }: HttpContextContract) {
    const user = await auth.authenticate()

    // if (
    //  !request.input('chapter_id') &&
    //  !request.input('parent_id') &&
    //  user?.role !== UserRole.ADMIN
    //) {
    //  return response.badRequest()
    //}

    const commentsQuery = Comment.query()

    if (request.input('chapter_id')) {
      commentsQuery.where('chapter_id', request.input('chapter_id'))
    }

    if (request.input('parent_id')) {
      commentsQuery.where('parent_id', request.input('parent_id'))
    } else if (!request.input('all')) {
      commentsQuery.whereNull('parent_id')
    }

    const comments = await commentsQuery
      .preload('user')
      .preload('chapter', (query) => {
        query.preload('novel')
      })
      .preload('subComments', (query) => {
        query
          .preload('user')
          .withCount('likes')
          .withCount('dislikes')
          .orderBy('is_pinned', 'desc')
          .orderBy('created_at', 'desc')
      })
      .withCount('subComments')
      .withCount('likes')
      .withCount('dislikes')
      .orderBy('is_pinned', 'desc')
      .orderBy('created_at', 'desc')
      .paginate(request.input('page', 1), request.input('take', 10))

    const commentsJson = comments.toJSON()

    if (user) {
      commentsJson.data = await Promise.all(
        commentsJson.data.map(async (item) => {
          const isLiked = await item.isLiked(user)
          const isDisliked = await item.isDisliked(user)

          const subComments = await Promise.all(
            item.subComments.map(async (subComment) => {
              const isSubCommentLiked = await subComment.isLiked(user)
              const isSubCommentDisliked = await subComment.isDisliked(user)

              return {
                ...subComment.toJSON(),
                is_liked: isSubCommentLiked,
                is_disliked: isSubCommentDisliked,
              }
            })
          )

          return {
            ...item.toJSON(),
            subComments,
            is_liked: isLiked,
            is_disliked: isDisliked,
          }
        })
      )
    }

    return response.send(commentsJson)
  }

  async store({ bouncer, request, auth, response }: HttpContextContract) {
    await bouncer.authorize('auth')
    const user = await auth.authenticate()

    if (user.mutedAt) {
      return response.unauthorized({
        status: 'failure',
        message: `Belirtilen tarihe kadar yorum yapamazsınız. (${format(
          user.mutedAt.toJSDate(),
          DateFormat
        )})`,
      })
    }

    const data = await request.validate(CreateCommentRequestValidator)

    const chapter = await Chapter.query().where('id', data.chapter_id).firstOrFail()
    const { isOpened } = await chapter.checkUser(user)

    if (!isOpened) {
      return response.unauthorized({
        status: 'failure',
        message: `Yorum yapabilmeniz için bölümü satın almanız gerekmektedir.`,
      })
    }

    const comment = await Comment.create({
      ...data,
      user_id: user.id,
    })

    await NotificationService.onComment(comment)

    await comment.load('user')
    await comment.load('chapter', (query) => {
      query.preload('novel')
    })
    await comment.load('subComments', (query) => {
      query.preload('user').withCount('likes').withCount('dislikes')
    })
    await comment.loadCount('subComments')
    await comment.loadCount('likes')
    await comment.loadCount('dislikes')

    return response.json(comment)
  }

  async update({ params, bouncer, auth, request, response }: HttpContextContract) {
    await bouncer.authorize('auth')
    const user = await auth.authenticate()

    if (user.mutedAt) {
      return response.unauthorized({
        status: 'failure',
        message: `Belirtilen tarihe kadar yorum güncelleyemezsiniz. (${format(
          user.mutedAt.toJSDate(),
          DateFormat
        )})`,
      })
    }

    const comment = await Comment.findOrFail(params.id)

    if (comment.user_id !== user.id) {
      await bouncer.authorize('isAdmin')
    }

    const data = await request.validate(UpdateCommentRequestValidator)

    await comment.merge(data)
    await comment.save()

    await comment.load('user')
    await comment.load('chapter', (query) => {
      query.preload('novel')
    })
    await comment.load('subComments', (query) => {
      query.preload('user').withCount('likes').withCount('dislikes')
    })
    await comment.loadCount('subComments')
    await comment.loadCount('likes')
    await comment.loadCount('dislikes')

    await NotificationService.onUpdate('comments', comment.id, comment.body)

    return response.json(comment)
  }

  public async destroy({ auth, response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('auth')
    const user = await auth.authenticate()

    if (user.mutedAt) {
      return response.unauthorized({
        status: 'failure',
        message: `Belirtilen tarihe kadar yorum silemezsiniz. (${format(
          user.mutedAt.toJSDate(),
          DateFormat
        )})`,
      })
    }

    const comment = await Comment.findOrFail(params.id)

    if (comment.user_id !== user.id) {
      await bouncer.authorize('isAdmin')
    }

    try {
      const deleted = await Comment.query().where('id', params.id).delete()

      if (deleted.includes(1)) {
        await NotificationService.onDelete('comments', comment.id)

        return response.ok(true)
      } else {
        return response.notFound()
      }
    } catch {
      return response.badRequest()
    }
  }
}
