import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PacketFactory from 'Database/factories/PacketFactory'

export default class extends BaseSeeder {
  public async run() {
    await PacketFactory.merge({
      name: '100 Coin',
      price: 10,
    }).create()
    await PacketFactory.merge({
      name: '200 Coin',
      price: 20,
    }).create()
    await PacketFactory.merge({
      name: '300 Coin',
      price: 30,
    }).create()
    await PacketFactory.merge({
      name: '400 Coin',
      price: 40,
    }).create()
    await PacketFactory.merge({
      name: '500 Coin',
      price: 50,
    }).create()
  }
}
