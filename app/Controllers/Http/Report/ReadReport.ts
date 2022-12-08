import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import _ from 'lodash'
import { DateTime } from 'luxon'

export default class ReadReport {
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

    const chapterReads = await Database.query()
      .from('chapter_read')
      .leftJoin('chapters', 'chapter_read.chapter_id', 'chapters.id')
      .leftJoin('novels', 'chapters.novel_id', 'novels.id')
      .whereNotNull('chapter_read.order_id')
      .count('chapter_read.chapter_id as read_count')
      .whereBetween('chapter_read.created_at', [
        startDate.minus({ days: 1 }).toFormat('yyyy-MM-dd'),
        endDate.plus({ days: 1 }).toFormat('yyyy-MM-dd'),
      ])
      .select(
        'novels.name as novel_name',
        Database.raw("date_trunc('day', chapter_read.created_at) as date")
      )
      .groupBy('novel_name')
      .groupByRaw("date_trunc('day', chapter_read.created_at)")

    const series = _.chain(chapterReads)
      .groupBy('novel_name')
      .map((_chapterReads, novelName) => {
        return {
          name: novelName,
          data: dates.map((date) => ({
            key: date.toFormat('dd/LL/yyyy'),
            value: parseFloat(
              _chapterReads.find(
                (x) =>
                  DateTime.fromJSDate(x.date).toFormat('dd/LL/yyyy') === date.toFormat('dd/LL/yyyy')
              )?.read_count || 0
            ),
          })),
        }
      })
      .value()

    return {
      chart: {
        type: 'line',
        title: 'Premium Bölüm Okunmaları',
        data: series,
      },
      table: {
        columns: [
          {
            Header: 'Seri Adı',
            accessor: 'novel_name',
          },
          {
            Header: 'Okunma Sayısı',
            accessor: 'read_count',
          },
        ],
        data: series
          .map((x) => ({
            novel_name: x.name,
            read_count: x.data.reduce((total, item) => item.value + total, 0),
          }))
          .sort((a, b) => b.read_count - a.read_count),
      },
    }
  }
}
