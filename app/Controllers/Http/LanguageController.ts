import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Language from 'App/Models/Language'
import LanguageRequestValidator from 'App/Validators/LanguageRequestValidator'

export default class LanguageController {
  async index({ response }: HttpContextContract) {
    const languages = await Language.query()

    return response.send(languages)
  }

  async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(LanguageRequestValidator)

    const language = await Language.create(data)

    return response.json(language)
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(LanguageRequestValidator)

    const language = await Language.findOrFail(params.id)

    await language.merge(data)
    await language.save()

    return response.json(language)
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    try {
      const deleted = await Language.query().where('id', params.id).delete()

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
