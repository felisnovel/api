import Factory from '@ioc:Adonis/Lucid/Factory'
import Packet from 'App/Models/Packet'

export default Factory.define(Packet, ({ faker }) => {
  const price = faker.datatype.number({ min: 1, max: 100 })

  return {
    name: price.toString() + ' Coin',
    price,
    amount: price,
  }
})
  // .state('admin', async (item) => {
  //  item.role = PacketRole.ADMIN
  // })
  .build()
