import OrderType from 'App/Enums/OrderType'
import Order from 'App/Models/Order'
import User from 'App/Models/User'

export default class OrderService {
  protected static async createOrder(user: User, type: OrderType, name: string, amount: number) {
    return await Order.create({
      user_id: user.id,
      type,
      name,
      amount,
      is_paid: true,
    })
  }

  public static async addFreeCoin(user: User, amount: number, name: string) {
    return await this.createOrder(user, OrderType.FREE, name, amount)
  }

  public static async addCoin(user: User, amount: number, name: string) {
    return await this.createOrder(user, OrderType.COIN, name, amount)
  }
}
