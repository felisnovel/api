import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserRole from 'App/Enums/UserRole'
import Comment from 'App/Models/Comment'
import UpdateCommentRequestValidator from 'App/Validators/UpdateCommentRequestValidator'
import CreateCommentRequestValidator from '../../Validators/CreateCommentRequestValidator'

export default class CommentController {
  async index({ response, auth, request }: HttpContextContract) {
    const user = await auth.authenticate()

    if (!request.input('chapter_id') && user?.role !== UserRole.ADMIN) {
      return response.badRequest()
    }

    let comments

    if (request.input('chapter_id')) {
      comments = await Comment.query().where('chapter_id', request.input('chapter_id'))
    } else {
      comments = await Comment.query()
    }

    return response.send(comments)
  }

  async store({ request, auth, response }: HttpContextContract) {
    const user = await auth.authenticate()

    const data = await request.validate(CreateCommentRequestValidator)

    const comment = await Comment.create({
      ...data,
      user_id: user.id,
    })

    return response.json(comment)
  }

  async update({ params, bouncer, auth, request, response }: HttpContextContract) {
    const user = await auth.authenticate()
    const comment = await Comment.findOrFail(params.id)

    if (comment.user_id !== user.id) {
      await bouncer.authorize('isAdmin')
    }

    const data = await request.validate(UpdateCommentRequestValidator)

    await comment.merge(data)
    await comment.save()

    return response.json(comment)
  }

  public async destroy({ auth, response, params, bouncer }: HttpContextContract) {
    const user = await auth.authenticate()
    const comment = await Comment.findOrFail(params.id)

    if (comment.user_id !== user.id) {
      await bouncer.authorize('isAdmin')
    }

    try {
      const deleted = await Comment.query().where('id', params.id).delete()

      if (deleted.includes(1)) {
        return response.ok(true)
      } else {
        return response.notFound()
      }
    } catch {
      return response.badRequest()
    }
  }
}
