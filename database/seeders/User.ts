import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import UserFactory from 'Database/factories/UserFactory'

export default class extends BaseSeeder {
  public async run() {
    await UserFactory.merge({
      username: 'lexor',
      email: 'emre@nerdesin.dev',
      password: 'secret',
    })
      .with('reviews', 2)
      .with('comments', 3)
      .with('followNovels', 4)
      .create()

    await UserFactory.merge({ password: 'password' })
      //.with('followNovels', 10)
      //.with('likeNovels', 10)
      //.with('readChapters', 10)
      .createMany(5)
  }
}
