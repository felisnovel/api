import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import OrderType from 'App/Enums/OrderType'
import ChapterFactory from 'Database/factories/ChapterFactory'
import CommentFactory from 'Database/factories/CommentFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import OrderFactory from 'Database/factories/OrderFactory'
import ReviewFactory from 'Database/factories/ReviewFactory'
import UserFactory from 'Database/factories/UserFactory'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    const admin = await UserFactory.merge({
      username: 'admin',
      email: 'admin@felis.dev',
      password: 'admin',
    })
      .apply('admin')
      .create()

    await UserFactory.merge({
      username: 'manager',
      email: 'manager@felis.dev',
      password: 'manager',
    })
      .apply('admin')
      .create()

    await UserFactory.merge({
      username: 'paymestest',
      email: 'testpaymes@gmail.com',
      password: '123Paymes123.',
    }).create()

    const order = await OrderFactory.merge({
      user_id: admin.id,
      type: OrderType.PLAN,
    }).create()

    const novels = await NovelFactory.with('volumes', 4, (volumeFactory) => {
      volumeFactory.apply('published')
    })
      .with('tags', 2)
      .merge({
        user_id: admin.id,
      })
      .apply('published')
      .createMany(25)

    for (const novel of novels) {
      for (const volume of novel.volumes) {
        const chapters = await ChapterFactory.merge({
          novel_id: novel.id,
          volume_id: volume.id,
          is_premium: novel.is_premium ? true : false,
        })
          .apply('published')
          .createMany(Math.floor(Math.random() * 10) + 1)

        ReviewFactory.merge({
          user_id: admin.id,
          novel_id: novel.id,
        }).create()

        for (const chapter of chapters) {
          if (chapter.is_premium) {
            const date = DateTime.local().plus({ days: Math.floor(Math.random() * 4) })

            await chapter.related('readUsers').attach({
              [admin.id]: {
                order_id: order.id,
                created_at: date,
                updated_at: date,
              },
            })
          }

          const comments = await CommentFactory.merge({
            user_id: admin.id,
            chapter_id: chapter.id,
          }).createMany(Math.floor(Math.random() * 5) + 1)

          CommentFactory.merge({
            user_id: admin.id,
            parent_id: comments[0].id,
            chapter_id: chapter.id,
          }).create()
        }
      }
    }
  }
}
