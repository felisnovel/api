import OrderPaymentType from 'App/Enums/OrderPaymentType'
import OrderStatus from 'App/Enums/OrderStatus'
import OrderType from 'App/Enums/OrderType'
import Order from 'App/Models/Order'
import { DateTime } from 'luxon'
import PaytrService from './PaytrService'

export default class PaymentService {
  async createPayment({ packet, user, payment_type, user_ip }) {
    await user.load('country')
    await user.load('city')

    if (!user.name || !user.surname) {
      throw new Error('Lütfen adınızı ve soyadınızı giriniz.')
    }

    if (!user.address) {
      throw new Error('Lütfen adresinizi giriniz.')
    }

    if (!user.country) {
      throw new Error('Lütfen ülkenizi seçiniz.')
    }

    if (!user.city) {
      throw new Error('Lütfen şehir seçiniz.')
    }

    if (!Object.values(OrderPaymentType).includes(payment_type)) {
      throw new Error('Ödeme yöntemi geçersiz.')
    }

    const payment_reference = 'IN' + DateTime.local().toMillis()

    const order = await user.related('orders').create({
      type: OrderType.COIN,
      name: packet.name,
      amount: packet.amount,
      price: packet.price,
      packet_id: packet.id,
      starts_at: DateTime.local(),
      payment_type,
      payment_reference,
    })

    const paytrService = new PaytrService()

    const iframe_token = await paytrService.createIframeToken({
      payment_reference,
      user_name: `${user.name} ${user.surname}`,
      user_address: user.address,
      user_phone: user.phone,
      user_email: user.email,
      order_price: order.price,
      order_name: order.name,
      user_ip,
      payment_type,
    })

    return {
      iframe_token,
    }
  }

  async verifyPayment(request) {
    const paytrService = new PaytrService()
    const isVerified = await paytrService.verifyPayment(
      request.input('hash'),
      request.input('merchant_oid'),
      request.input('status'),
      request.input('total_amount')
    )

    if (!isVerified) {
      return false
    }

    const order = await Order.query()
      .where('payment_reference', request.input('merchant_oid'))
      .firstOrFail()

    await order.merge({ status: OrderStatus.PAID }).save()

    return true
  }
}
