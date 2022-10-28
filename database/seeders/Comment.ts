import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ReactionTypeEnum from 'App/Enums/ReactionTypeEnum'
import ChapterFactory from 'Database/factories/ChapterFactory'
import CommentFactory from 'Database/factories/CommentFactory'
import CommentReactionFactory from 'Database/factories/CommentReactionFactory'
import NovelFactory from 'Database/factories/NovelFactory'

export default class extends BaseSeeder {
  public async run() {
    const novel = await NovelFactory.apply('published').create()

    const chapters = await ChapterFactory.with('volume', 1, (volumeFactory) =>
      volumeFactory
        .merge({
          volume_novel_id: novel.id,
        })
        .apply('published')
    )
      .merge({
        novel_id: novel.id,
      })
      .with('comments', 10, (commentFactory) => commentFactory.with('user', 1))
      .apply('published')
      .createMany(10)

    const chapter = chapters[0]

    CommentFactory.merge({
      parent_id: chapter.comments[0].id,
      chapter_id: chapter.id,
    })
      .with('user', 1)
      .create()

    await CommentReactionFactory.with('user', 1)
      .merge({
        comment_id: chapter.comments[1].id,
        type: ReactionTypeEnum.LIKE,
      })
      .createMany(5)

    await CommentReactionFactory.with('user', 1)
      .merge({
        comment_id: chapter.comments[2].id,
        type: ReactionTypeEnum.LIKE,
      })
      .createMany(10)

    await CommentReactionFactory.with('user', 1)
      .merge({
        comment_id: chapter.comments[3].id,
        type: ReactionTypeEnum.LIKE,
      })
      .createMany(3)

    await CommentReactionFactory.with('user', 1)
      .merge({
        comment_id: chapter.comments[4].id,
        type: ReactionTypeEnum.LIKE,
      })
      .createMany(1)
  }
}
