import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Contact from 'App/Models/Contact'
import CreateContactRequestValidator from 'App/Validators/CreateContactRequestValidator'
import UpdateContactRequestValidator from 'App/Validators/UpdateContactRequestValidator'

export default class ContactController {
  async index({ response, bouncer, request }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const contactsQuery = Contact.query()

    const contacts = await contactsQuery
      .preload('user')
      .orderBy('created_at', 'desc')
      .paginate(request.input('page', 1), request.input('take', 10))

    return response.send(contacts)
  }

  async store({ request, auth, response }: HttpContextContract) {
    const user = await auth.authenticate()

    const data = await request.validate(CreateContactRequestValidator)

    const contact = await Contact.create({
      ...data,
      user_id: user?.id,
    })

    return response.json(contact)
  }

  async update({ params, bouncer, request, response }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const contact = await Contact.findOrFail(params.id)

    const data = await request.validate(UpdateContactRequestValidator)

    await contact.merge(data)
    await contact.save()

    return response.json(contact)
  }

  public async destroy({ auth, response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    try {
      const deleted = await Contact.query().where('id', params.id).delete()

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
