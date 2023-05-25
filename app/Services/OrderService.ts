import Database from '@ioc:Adonis/Lucid/Database'
import OrderBuyType from 'App/Enums/OrderBuyType'
import OrderPaymentType from 'App/Enums/OrderPaymentType'
import OrderStatus from 'App/Enums/OrderStatus'
import OrderType from 'App/Enums/OrderType'
import Invoice from 'App/Models/Invoice'
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

      await order
        .merge({
          status: OrderStatus.PAID,
          buy_type: OrderBuyType.COIN,
          payment_type: OrderPaymentType.COIN,
        })
        .save()

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

  public async getOrdersForUser(user: User): Promise<Order[]> {
    return await user
      .related('orders')
      .query()
      .where('buy_type', OrderBuyType.TRY)
      .where('status', OrderStatus.PAID)
      .where((query) => {
        query
          .where((subQuery) => {
            subQuery.whereNotNull('plan_id').where('type', OrderType.PLAN)
          })
          .orWhere((subQuery) => {
            subQuery.whereNotNull('packet_id').where('type', OrderType.COIN)
          })
      })
      .preload('plan')
      .preload('packet')
      .doesntHave('invoice')
  }

  public async createInvoiceForUser(user: User): Promise<Invoice> {
    const orders = await this.getOrdersForUser(user)

    if (orders.length === 0) {
      throw new Error('Faturalandırılacak sipariş bulunamadı.')
    }

    const invoice = Database.transaction(async () => {
      const newInvoice = await Invoice.create({
        user_id: user.id,
        net_total: orders.reduce((acc, order) => Number(acc) + (Number(order.price) ?? 0), 0),
      })

      await Order.query()
        .whereIn(
          'id',
          orders.map((order) => order.id)
        )
        .update({
          invoice_id: newInvoice.id,
        })

      return newInvoice
    })

    return invoice
  }
}
