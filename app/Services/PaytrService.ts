import Config from '@ioc:Adonis/Core/Config'
import OrderPaymentType from 'App/Enums/OrderPaymentType'
import HttpException from 'App/Exceptions/HttpException'
import axios from 'axios'
import crypto from 'crypto'
import nodeBase64 from 'nodejs-base64-converter'

export default class PaytrService {
  public async createIframeToken({
    payment_reference,
    user_name,
    user_email,
    user_phone,
    user_address,
    payment_type,
    order_price,
    order_name,
    user_ip,
  }) {
    if (!order_price || order_price <= 0) {
      throw new HttpException('Sipariş tutarı 0 veya daha düşük olamaz.', 400)
    }

    if (!payment_type) {
      throw new HttpException('Ödeme yöntemi bulunamadı!', 400)
    }

    const basket = JSON.stringify([[order_name, '18.00', order_price]])
    const email = user_email
    const payment_amount = order_price * 100

    const data = {
      merchant_oid: payment_reference,
      user_name,
      user_phone,
      user_address,
      merchant_id,
      email,
      payment_amount,
      user_ip,
      basket,
    }

    const { hash, params } = this.createHashAndParams(payment_type, data)

    const response = await this.getToken(hash, params, data)

    return response.token
  }

  public async verifyPayment(hash, merchant_oid, status, total_amount) {
    const paytr_token = merchant_oid + merchant_salt + status + total_amount

    const token = crypto.createHmac('sha256', merchant_key).update(paytr_token).digest('base64')

    if (token !== hash) {
      throw new Error('PAYTR notification failed: bad hash')
    }

    if (status === 'success' && merchant_oid) {
      return true
    } else {
      return false
    }
  }

  private async getToken(hash, params, data) {
    const { user_name, user_phone, email, payment_amount, merchant_oid, user_ip } = data
    const token = hash + merchant_salt

    const paytr_token = crypto.createHmac('sha256', merchant_key).update(token).digest('base64')

    const response = await axios.post(
      'https://www.paytr.com/odeme/api/get-token',
      {
        merchant_id,
        user_name,
        user_phone,
        email,
        payment_amount,
        merchant_oid,
        user_ip,
        timeout_limit,
        debug_on,
        test_mode,
        paytr_token,
        ...params,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    if (response.data.status !== 'success') {
      throw new HttpException('Hata oluştu! ', 400)
    }

    return response.data
  }

  private createHashAndParams(payment_type, data) {
    const { basket, user_ip, merchant_oid, email, payment_amount } = data
    const user_basket = nodeBase64.encode(basket)

    switch (payment_type) {
      case OrderPaymentType.CARD:
        const { user_address } = data

        const max_installment = '0'
        const no_installment = '0'

        return {
          hash: `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`,
          params: {
            user_address,
            user_basket,
            merchant_key,
            merchant_salt,
            currency,
            no_installment,
            max_installment,
            merchant_ok_url,
            merchant_fail_url,
            lang,
          },
        }
      case OrderPaymentType.EFT:
        return {
          hash: `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${test_mode}`,
          params: {
            payment_type,
          },
        }
      default:
        throw new HttpException('Ödeme yöntemi bulunamadı!', 400)
    }
  }
}

const merchant_id = Config.get('paytr.merchantId')
const merchant_key = Config.get('paytr.merchantKey')
const merchant_salt = Config.get('paytr.merchantSalt')
const merchant_ok_url = Config.get('paytr.merchantOkUrl')
const merchant_fail_url = Config.get('paytr.merchantFailUrl')
const test_mode = Config.get('paytr.testMode')
const debug_on = Config.get('paytr.debugOn')
const lang = 'tr'
const timeout_limit = 30
const currency = 'TL'
