import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PacketFactory from 'Database/factories/PacketFactory'

export default class extends BaseSeeder {
  public async run() {
    await PacketFactory.merge({
      name: '100 Coin',
      original_price: 10,
    }).create()
    await PacketFactory.merge({
      name: '200 Coin',
      original_price: 20,
    }).create()
    await PacketFactory.merge({
      name: '300 Coin',
      original_price: 30,
    }).create()
    await PacketFactory.merge({
      name: '400 Coin',
      original_price: 40,
    }).create()
    await PacketFactory.merge({
      name: '500 Coin',
      original_price: 50,
    }).create()
  }
}
