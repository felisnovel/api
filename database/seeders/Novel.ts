import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ChapterFactory from 'Database/factories/ChapterFactory'
import CommentFactory from 'Database/factories/CommentFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import ReviewFactory from 'Database/factories/ReviewFactory'
import UserFactory from 'Database/factories/UserFactory'

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
        })
          .apply('published')
          .createMany(Math.floor(Math.random() * 10) + 1)

        ReviewFactory.merge({
          user_id: admin.id,
          novel_id: novel.id,
        }).create()

        for (const chapter of chapters) {
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
