import Config from '@ioc:Adonis/Core/Config'
import HttpException from 'App/Exceptions/HttpException'
import axios from 'axios'
import crypto from 'crypto'
import { DateTime } from 'luxon'
import nodeBase64 from 'nodejs-base64-converter'
import Order from '../Models/Order'

const merchantId = Config.get('paytr.merchantId')
const merchantKey = Config.get('paytr.merchantKey')
const merchantSalt = Config.get('paytr.merchantSalt')

export default class PaytrService {
  public static async createIframeToken(order: Order, { ip, data }) {
    await order.load('user')
    const user = order.user

    if (order.is_paid) {
      throw new HttpException('Bu sipariş zaten ödenmiş.', 400)
    }

    if (!order.price || order.price <= 0) {
      throw new HttpException('Sipariş tutarı 0 veya daha düşük olamaz.', 400)
    }

    const basket = JSON.stringify([[order.name, '18.00', order.price]])
    const merchantOid = 'IN' + DateTime.local().toMillis()
    const userIp = ip
    const email = user.email
    const paymentAmount = order.price * 100
    const testMode = Config.get('paytr.testMode')
    const userName = data.name
    const userAddress = data.address
    const userPhone = data.phone
    const paymentType = data.payment_type

    const merchantOkUrl = Config.get('paytr.merchantOkUrl')
    const merchantFailUrl = Config.get('paytr.merchantFailUrl')
    const timeoutLimit = 30
    const debugOn = Config.get('paytr.debugOn')
    const lang = 'tr'

    let hashSTR
    let requestExtraParams

    const userBasket = nodeBase64.encode(basket)

    if (paymentType === 'card') {
      const maxInstallment = '0'
      const noInstallment = '0'
      const currency = 'TL'
      hashSTR = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`

      requestExtraParams = {
        merchant_key: merchantKey,
        merchant_salt: merchantSalt,
        currency: currency,
        user_address: userAddress,
        no_installment: noInstallment,
        max_installment: maxInstallment,
        merchant_ok_url: merchantOkUrl,
        merchant_fail_url: merchantFailUrl,
        lang: lang,
      }
    } else if (paymentType === 'eft') {
      hashSTR = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${paymentType}${testMode}`

      requestExtraParams = {
        payment_type: paymentType,
      }
    } else {
      throw new HttpException('Ödeme tipi geçersiz.', 400)
    }

    const paytrToken = hashSTR + merchantSalt

    const token = crypto.createHmac('sha256', merchantKey).update(paytrToken).digest('base64')

    const response = await axios.post(
      'https://www.paytr.com/odeme/api/get-token',
      {
        user_name: userName,
        user_phone: userPhone,
        merchant_id: merchantId,
        user_basket: userBasket,
        email: email,
        payment_amount: paymentAmount,
        merchant_oid: merchantOid,
        user_ip: userIp,
        timeout_limit: timeoutLimit,
        debug_on: debugOn,
        test_mode: testMode,
        paytr_token: token,
        ...requestExtraParams,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    if (response.data.status === 'success') {
      return response.data.token
    } else {
      console.log('response.data', response.data)
      throw new HttpException('Hata oluştu! ', 400)
    }
  }

  public static async verifyPayment(request) {
    const paytr_token =
      request.input('merchant_oid') +
      merchantSalt +
      request.input('status') +
      request.input('total_amount')

    const token = crypto.createHmac('sha256', merchantKey).update(paytr_token).digest('base64')

    if (token !== request.input('hash')) {
      throw new Error('PAYTR notification failed: bad hash')
    }

    if (request.input('status') === 'success') {
      const order = await Order.query()
        .where('payment_reference', request.input('merchant_oid'))
        .firstOrFail()

      await order.merge({ is_paid: true }).save()

      return true
    } else {
      return false
    }
  }
}
