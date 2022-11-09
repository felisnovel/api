import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ChapterFactory from 'Database/factories/ChapterFactory'
import UserFactory from 'Database/factories/UserFactory'

export default class extends BaseSeeder {
  public async run() {
    const admin1 = await UserFactory.merge({
      username: 'admin',
      email: 'admin@felis.dev',
      password: 'admin',
    })
      .with('followNovels', 8, (novelFactory) =>
        novelFactory
          .with('user', 1)
          .apply('published')
          .with('tags', 2)
          .with('volumes', 1, (volumeFactory) => volumeFactory.apply('published'))
      )
      .apply('admin')
      .create()

    admin1.followNovels.forEach(async (novel) => {
      await ChapterFactory.apply('published')
        .merge({
          novel_id: novel.id,
          volume_id: novel.volumes[0].id,
        })
        .createMany(2)
    })

    await UserFactory.merge({
      username: 'manager',
      email: 'manager@felis.dev',
      password: 'manager',
    })
      .apply('admin')
      .create()
  }
}
