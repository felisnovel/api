import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import City from 'App/Models/City'

export default class CityController {
  async index({ request, response }: HttpContextContract) {
    const citiesQuery = City.query()

    if (request.input('country_id')) {
      citiesQuery.where('country_id', request.input('country_id'))
    }

    const cities = await citiesQuery.orderBy('name', 'asc')

    return response.send(cities)
  }
}
