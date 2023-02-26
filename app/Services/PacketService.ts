import OrderBuyType from 'App/Enums/OrderBuyType'
import OrderType from 'App/Enums/OrderType'
import Packet from 'App/Models/Packet'
import User from 'App/Models/User'
import OrderService from './OrderService'

export default class PacketService {
  public static async createOrder({ user, packet }: { user: User; packet: Packet }) {
    return await OrderService.createOrder({
      user,
      buy_type: OrderBuyType.TRY,
      packet_id: packet.id,
      amount: packet.amount,
      price: packet.price,
      type: OrderType.COIN,
      name: packet.name,
    })
  }
}
