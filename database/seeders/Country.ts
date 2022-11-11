import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import CountryFactory from 'Database/factories/CountryFactory'

export default class extends BaseSeeder {
  public async run() {
    await CountryFactory.merge({
      name: 'United States',
      key: 'US',
    }).create()

    await CountryFactory.merge({
      name: 'Canada',
      key: 'CA',
    }).create()

    await CountryFactory.merge({
      name: 'United Kingdom',
      key: 'GB',
    }).create()
  }
}
