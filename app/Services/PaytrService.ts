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
    const userBasket = nodeBase64.encode(basket)
    const merchantOid = 'IN' + DateTime.local().toMillis() // Sipariş numarası: Her işlemde benzersiz olmalıdır!! Bu bilgi bildirim sayfanıza yapılacak bildirimde geri gönderilir.
    // Sayfada görüntülenecek taksit adedini sınırlamak istiyorsanız uygun şekilde değiştirin.
    // Sıfır (0) gönderilmesi durumunda yürürlükteki en fazla izin verilen taksit geçerli olur.
    const maxInstallment = '0'
    const noInstallment = '0' // Taksit yapılmasını istemiyorsanız, sadece tek çekim sunacaksanız 1 yapın.
    const userIp = ip // Müşterinizin IP adresi
    const email = user.email // Müşterinizin sitenizde kayıtlı veya form vasıtasıyla aldığınız eposta adresi.
    const paymentAmount = order.price * 100 // Tahsil edilecek tutar. 9.99 için 9.99 * 100 = 999 gönderilmelidir.
    const currency = 'TL'
    const testMode = Config.get('paytr.testMode') // Mağaza canlı modda iken test işlem yapmak için 1 olarak gönderilebilir.
    const userName = data.name // Müşterinizin sitenizde kayıtlı veya form aracılığıyla aldığınız ad ve soyad bilgisi
    const userAddress = data.address // Müşterinizin sitenizde kayıtlı veya form aracılığıyla aldığınız adres bilgisi
    const userPhone = data.phone // Müşterinizin sitenizde kayıtlı veya form aracılığıyla aldığınız telefon bilgisi

    const merchantOkUrl = Config.get('paytr.merchantOkUrl')
    // Ödeme sürecinde beklenmedik bir hata oluşması durumunda müşterinizin yönlendirileceği sayfa
    // Bu sayfa siparişi iptal edeceğiniz sayfa değildir! Yalnızca müşterinizi bilgilendireceğiniz sayfadır!
    const merchantFailUrl = Config.get('paytr.merchantFailUrl')
    const timeoutLimit = 30 // İşlem zaman aşımı süresi - dakika cinsinden
    const debugOn = Config.get('paytr.debugOn') // Hata mesajlarının ekrana basılması için entegrasyon ve test sürecinde 1 olarak bırakın. Daha sonra 0 yapabilirsiniz.
    const lang = 'tr' // Türkçe için tr veya İngilizce için en gönderilebilir. Boş gönderilirse tr geçerli olur.

    const hashSTR = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`

    const paytrToken = hashSTR + merchantSalt

    const token = crypto.createHmac('sha256', merchantKey).update(paytrToken).digest('base64')

    const response = await axios.post(
      'https://www.paytr.com/odeme/api/get-token',
      {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        merchant_salt: merchantSalt,
        email: email,
        payment_amount: paymentAmount,
        merchant_oid: merchantOid,
        user_name: userName,
        user_address: userAddress,
        user_phone: userPhone,
        merchant_ok_url: merchantOkUrl,
        merchant_fail_url: merchantFailUrl,
        user_basket: userBasket,
        user_ip: userIp,
        timeout_limit: timeoutLimit,
        debug_on: debugOn,
        test_mode: testMode,
        lang: lang,
        no_installment: noInstallment,
        max_installment: maxInstallment,
        currency: currency,
        paytr_token: token,
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
