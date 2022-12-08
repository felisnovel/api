import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PlanFactory from 'Database/factories/PlanFactory'

export default class extends BaseSeeder {
  public async run() {
    await PlanFactory.merge({
      name: 'Tekir',
      amount: 250,
      no_ads: true,
      discord_features: true,
    }).create()

    await PlanFactory.merge({
      name: 'Ankara',
      amount: 350,
      no_ads: true,
      discord_features: true,
      premium_eps: true,
    }).create()

    await PlanFactory.merge({
      name: 'Van',
      amount: 450,
      download: true,
      no_ads: true,
      discord_features: true,
      premium_eps: true,
    }).create()
  }
}
