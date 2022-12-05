import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Promocode from 'App/Models/Promocode'
import { DateTime } from 'luxon'
import OrderType from '../../../Enums/OrderType'

export default class UsePromocode {
  async invoke({ auth, request, response }: HttpContextContract) {
    const user = await auth.authenticate()

    const promocode = await Promocode.query()
      .where('active', true)
      .where('code', request.input('code'))
      .firstOrFail()

    if (promocode.limit <= promocode.used) {
      return response.status(400).send({
        message: 'Bu promomosyon kodunun kullanımı sona ermiştir',
      })
    }

    const isOrder = await promocode.related('orders').query().where('user_id', user.id).first()

    if (isOrder) {
      return response.status(400).send({
        message: 'Bu promosyon kodunu daha önce kullanmışsınız.',
      })
    }

    await promocode.merge({ used: promocode.used + 1 })
    await promocode.save()

    await user.related('orders').create({
      type: OrderType.COIN,
      name: promocode.name,
      amount: promocode.amount,
      is_paid: true,
      promocode_id: promocode.id,
      starts_at: DateTime.local(),
    })

    return response.status(200).send(user)
  }
}
