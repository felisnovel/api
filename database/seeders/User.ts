import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ReactionTypeEnum from 'App/Enums/ReactionTypeEnum'
import CommentReactionFactory from 'Database/factories/CommentReactionFactory'
import UserFactory from 'Database/factories/UserFactory'

export default class extends BaseSeeder {
  public async run() {
    const user = await UserFactory.merge({
      username: 'lexor',
      email: 'emre@nerdesin.dev',
      password: 'secret',
    })
      .with('reviews', 2)
      .with('comments', 3)
      .with('followNovels', 4)
      .with('comments', 10)
      .create()

    await CommentReactionFactory.with('user', 1)
      .merge({
        comment_id: user.comments[1].id,
        type: ReactionTypeEnum.LIKE,
      })
      .createMany(5)

    await CommentReactionFactory.with('user', 1)
      .merge({
        comment_id: user.comments[2].id,
        type: ReactionTypeEnum.LIKE,
      })
      .createMany(10)

    await CommentReactionFactory.with('user', 1)
      .merge({
        comment_id: user.comments[3].id,
        type: ReactionTypeEnum.LIKE,
      })
      .createMany(3)

    await CommentReactionFactory.with('user', 1)
      .merge({
        comment_id: user.comments[4].id,
        type: ReactionTypeEnum.LIKE,
      })
      .createMany(1)

    await UserFactory.merge({ password: 'password' })
      //.with('followNovels', 10)
      //.with('likeNovels', 10)
      //.with('readChapters', 10)
      .createMany(5)
  }
}
