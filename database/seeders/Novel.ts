import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Novel from 'App/Models/Novel'
import ChapterFactory from 'Database/factories/ChapterFactory'
import NovelFactory from 'Database/factories/NovelFactory'

export default class extends BaseSeeder {
  public async run() {
    await NovelFactory.with('tags', 2)
      .merge({
        is_promoted: true,
      })
      .createMany(10)

    const novels = await Novel.all()

    for (const novel of novels) {
      await ChapterFactory.merge({
        novel_id: novel.id,
      })
        .with('volume', 1, (volumeFactory) =>
          volumeFactory.merge({
            volume_novel_id: novel.id,
          })
        )
        .createMany(10)
    }
  }
}
