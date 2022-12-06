import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { getCalendarDatesForRange, getWeekForDay } from '../../../../utils'

export default class ReadReport {
  async invoke({}: HttpContextContract) {
    const initialDate = DateTime.local()
    const selectedWeek = getWeekForDay(initialDate)
    const dates = getCalendarDatesForRange(selectedWeek)

    const chapterReads = await Database.query()
      .from('chapter_read')
      .leftJoin('chapters', 'chapter_read.chapter_id', 'chapters.id')
      .leftJoin('novels', 'chapters.novel_id', 'novels.id')
      .whereNotNull('chapter_read.order_id')
      .count('chapter_read.chapter_id as read_count')
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

    return series
  }
}
