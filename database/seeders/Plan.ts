import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PlanFactory from 'Database/factories/PlanFactory'

export default class extends BaseSeeder {
  public async run() {
    await PlanFactory.merge({
      name: 'Basit',
      amount: 49.99,
    }).create()

    await PlanFactory.merge({
      name: 'Pro',
      amount: 99,
      no_ads: true,
    }).create()

    await PlanFactory.merge({
      name: 'Ultimate',
      amount: 249.99,
      download: true,
      no_ads: true,
      discord_features: true,
    }).create()
  }
}
