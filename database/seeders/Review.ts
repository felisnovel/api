import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import NovelFactory from 'Database/factories/NovelFactory'

export default class extends BaseSeeder {
  public async run() {
    NovelFactory.with('user', 1)
      .with('reviews', 10, (reviewFactory) => reviewFactory.with('user', 1))
      .apply('published')
      .create()
  }
}
