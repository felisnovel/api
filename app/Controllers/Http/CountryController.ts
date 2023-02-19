import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Country from 'App/Models/Country'
import CountryRequestValidator from 'App/Validators/CountryRequestValidator'

export default class CountryController {
  async index({ response }: HttpContextContract) {
    const countries = await Country.query().orderBy('name', 'asc')

    return response.send(countries)
  }

  async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(CountryRequestValidator)

    const country = await Country.create({
      name: data.name,
      key: data.key,
    })

    return response.json(country)
  }

  async update({ params, request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    const data = await request.validate(CountryRequestValidator)

    const country = await Country.findOrFail(params.id)

    await country.merge(data)
    await country.save()

    return response.json(country)
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    await bouncer.authorize('isAdmin')

    try {
      const deleted = await Country.query().where('id', params.id).delete()

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
