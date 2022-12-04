import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { getCalendarDatesForRange, getWeekForDay } from '../../../../utils'
import OrderType from '../../../Enums/OrderType'
import Order from '../../../Models/Order'

export default class CoinReport {
  async invoke({}: HttpContextContract) {
    const initialDate = DateTime.local()
    const selectedWeek = getWeekForDay(initialDate)
    const dates = getCalendarDatesForRange(selectedWeek)

    const orders = await Order.query().where('type', OrderType.COIN).preload('packet')

    const series = _.chain(orders)
      .groupBy('packet.name')
      .map((packetOrders, packetName) => {
        console.log(packetOrders[0].amount)
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

    return [
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
    ]
  }
}
