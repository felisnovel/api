import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import UpdateCommentRequestValidator from 'App/Validators/UpdateCommentRequestValidator'
import { format } from 'date-fns'
import NotificationService from '../../Services/NotificationService'
import CreateCommentRequestValidator from '../../Validators/CreateCommentRequestValidator'

const DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss'
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
    } else {
      commentsQuery.whereNull('parent_id')
    }

    const comments = await commentsQuery
      .preload('user')
      .preload('subComments', (query) => {
        query.preload('user').withCount('likes').withCount('dislikes')
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

  async store({ request, auth, response }: HttpContextContract) {
    const user = await auth.authenticate()

    if (user.mutedAt) {
      return response.unauthorized({
        status: 'failure',
        message: `Belirtilen tarihe kadar yorum yapamazsiniz. (${format(
          user.mutedAt.toJSDate(),
          DATE_FORMAT
        )})`,
      })
    }

    const data = await request.validate(CreateCommentRequestValidator)

    const comment = await Comment.create({
      ...data,
      user_id: user.id,
    })

    await NotificationService.onComment(comment)

    return response.json(comment)
  }

  async update({ params, bouncer, auth, request, response }: HttpContextContract) {
    const user = await auth.authenticate()

    if (user.mutedAt) {
      return response.unauthorized({
        status: 'failure',
        message: `Belirtilen tarihe kadar yorum güncelleyemezsiniz. (${format(
          user.mutedAt.toJSDate(),
          DATE_FORMAT
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

    await NotificationService.onUpdate('comments', comment.id, comment.body)

    return response.json(comment)
  }

  public async destroy({ auth, response, params, bouncer }: HttpContextContract) {
    const user = await auth.authenticate()

    if (user.mutedAt) {
      return response.unauthorized({
        status: 'failure',
        message: `Belirtilen tarihe kadar yorum silemezsiniz. (${format(
          user.mutedAt.toJSDate(),
          DATE_FORMAT
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
