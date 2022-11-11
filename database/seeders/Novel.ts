import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ChapterFactory from 'Database/factories/ChapterFactory'
import NovelFactory from 'Database/factories/NovelFactory'

export default class extends BaseSeeder {
  public async run() {
    const novels = await NovelFactory.with('user', 1)
      .with('volumes', 1)
      .with('tags', 2)
      .merge({
        is_promoted: true,
      })
      .createMany(22)

    for (const novel of novels) {
      await ChapterFactory.merge({
        novel_id: novel.id,
        volume_id: novel.volumes[0].id,
      }).createMany(25)
    }
  }
}
