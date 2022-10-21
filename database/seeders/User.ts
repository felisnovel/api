import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import UserFactory from 'Database/factories/UserFactory'

export default class extends BaseSeeder {
  public async run() {
    await UserFactory.merge({ password: 'password' })
      //.with('followNovels', 10)
      //.with('likeNovels', 10)
      //.with('readChapters', 10)
      .createMany(5)

    await User.createMany([
      {
        username: 'lexor',
        email: 'emre@nerdesin.dev',
        password: 'secret',
      },
    ])
  }
}
