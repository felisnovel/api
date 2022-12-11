import { test } from '@japa/runner'
import ChapterFactory from 'Database/factories/ChapterFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import UserFactory from 'Database/factories/UserFactory'
import OrderType from '../../app/Enums/OrderType'
import { cleanAll } from '../utils'

test.group('Reports', (group) => {
  group.each.setup(cleanAll)

  test('read reports', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const users = await UserFactory.with('orders', 1, (orderFactory) => {
      orderFactory.merge({
        type: OrderType.PLAN,
      })
    }).createMany(3)

    const NOVEL1_READ_COUNT = 1
    const NOVEL2_READ_COUNT = 2
    const NOVEL3_READ_COUNT = 3

    const novel1 = await createNovelAndChapters(users.slice(0, NOVEL1_READ_COUNT))
    const novel2 = await createNovelAndChapters(users.slice(0, NOVEL2_READ_COUNT))
    const novel3 = await createNovelAndChapters(users.slice(0, NOVEL3_READ_COUNT))

    const response = await client.get(`/reports/reads`).loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      chart: {
        data: [
          {
            name: novel1.name,
            data: [
              {
                value: NOVEL1_READ_COUNT,
              },
            ],
          },
          {
            name: novel2.name,
            data: [
              {
                value: NOVEL2_READ_COUNT,
              },
            ],
          },
          {
            name: novel3.name,
            data: [
              {
                value: NOVEL3_READ_COUNT,
              },
            ],
          },
        ],
      },
    })
  })
})

async function createNovelAndChapters(users) {
  const novel = await NovelFactory.with('user', 1).with('volumes', 1).create()
  const chapter = await ChapterFactory.merge({
    novel_id: novel.id,
    volume_id: novel.volumes[0].id,
  }).create()

  for (const user of users) {
    await chapter.related('readUsers').attach({
      [user.id]: {
        order_id: users[0].orders[0].id,
      },
    })
  }

  return novel
}
