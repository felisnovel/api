import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import _ from 'lodash'
import { DateTime } from 'luxon'
import OrderType from '../../../Enums/OrderType'
import Order from '../../../Models/Order'

export default class CoinReport {
  async invoke({ request }: HttpContextContract) {
    const startDate = request.input('startDate')
      ? DateTime.fromFormat(request.input('startDate'), 'yyyy/MM/dd')
      : DateTime.local().minus({ weeks: 1 })
    const endDate = DateTime.fromFormat(
      request.input('endDate', DateTime.local().toFormat('yyyy/MM/dd')),
      'yyyy/MM/dd'
    )

    const dates = []

    if (startDate <= endDate) {
      let currentDate = startDate

      while (currentDate <= endDate) {
        dates.push(currentDate)
        currentDate = currentDate.plus({ days: 1 })
      }
    }

    const orders = await Order.query()
      .where('type', OrderType.COIN)
      .preload('packet')
      .whereBetween('created_at', [
        startDate.minus({ days: 1 }).toFormat('yyyy-MM-dd'),
        endDate.plus({ days: 1 }).toFormat('yyyy-MM-dd'),
      ])

    const series = _.chain(orders)
      .groupBy('packet.name')
      .map((packetOrders, packetName) => {
        return {
          name: packetName || 'Belirsiz',
          data: dates.map((date) => ({
            key: date.toFormat('dd/LL/yyyy'),
            value: packetOrders
              .filter((x) => x.createdAt.toFormat('dd/LL/yyyy') === date.toFormat('dd/LL/yyyy'))
              .reduce((total, item) => parseFloat(item.amount) + total, 0),
          })),
        }
      })
      .value()

    const totalOrders = dates.map((date) => ({
      key: date.toFormat('dd/LL/yyyy'),
      value: orders
        .filter((x) => x.createdAt.toFormat('dd/LL/yyyy') === date.toFormat('dd/LL/yyyy'))
        .reduce((total, item) => parseFloat(item.amount) + total, 0),
    }))

    return {
      chart: {
        type: 'combo',
        title: 'Coin/Paket Satışları',
        data: [
          {
            shape: 'Bar',
            name: 'Paket Satışları',
            series: series,
          },
          {
            shape: 'Line',
            name: 'Toplam Satışlar',
            series: [
              {
                name: 'Coin Miktarı',
                data: totalOrders,
              },
            ],
          },
        ],
      },
    }
  }
}
