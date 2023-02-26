import OrderBuyType from 'App/Enums/OrderBuyType'
import OrderPaymentType from 'App/Enums/OrderPaymentType'
import OrderStatus from 'App/Enums/OrderStatus'
import OrderType from 'App/Enums/OrderType'
import Order from 'App/Models/Order'
import User from 'App/Models/User'
import PaymentService from './PaymentService'

export default class OrderService {
  protected static async createCoinOrder(
    user: User,
    type: OrderType,
    name: string,
    amount: number
  ) {
    return await Order.create({
      user_id: user.id,
      type,
      name,
      amount,
      status: OrderStatus.PAID,
    })
  }

  public static async addFreeCoin(user: User, amount: number, name: string) {
    return await this.createCoinOrder(user, OrderType.FREE, name, amount)
  }

  public static async addCoin(user: User, amount: number, name: string) {
    return await this.createCoinOrder(user, OrderType.COIN, name, amount)
  }

  public static async createOrder({
    name,
    amount,
    price,
    buy_type,
    type,
    user,
    plan_id,
    packet_id,
  }: {
    name: string
    amount?: number
    price?: number
    buy_type?: OrderBuyType
    user: User
    type: OrderType
    plan_id?: number
    packet_id?: number
  }) {
    const order = await user.related('orders').create({
      type,
      name,
      amount,
      price,
      plan_id,
      packet_id,
      buy_type,
    })

    return order
  }

  public static async pay({
    payment_type,
    user,
    order,
    user_ip,
  }: {
    order: Order
    user: User
    payment_type: OrderPaymentType
    user_ip: string
  }) {
    if (order.status === OrderStatus.PAID) {
      throw new Error('Bu siparişin ödemesi başarılı!')
    }

    if (payment_type === OrderPaymentType.COIN) {
      if (!user.buyableOf(order.amount)) {
        throw new Error('Yetersiz bakiye!')
      }

      await order.merge({ status: OrderStatus.PAID, buy_type: OrderBuyType.COIN }).save()

      return {
        success: 'true',
        message: 'Satın alım başarılı!',
      }
    } else {
      const paymentService = await new PaymentService()

      const iframe_token = await paymentService.createPayment({
        order,
        user,
        payment_type,
        user_ip,
      })

      return {
        success: 'pending',
        iframe_token,
      }
    }
  }

  public static async updateStatus(order: Order, status: OrderStatus) {
    await order.merge({
      status,
    })
    await order.save()
  }
}
