import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class MainSeeder extends BaseSeeder {
  private async runSeeder(seeder: { default: typeof BaseSeeder }) {
    await new seeder.default(this.client).run()
  }

  public async run() {
    await this.runSeeder(await import('../CountrySeeder'))
    await this.runSeeder(await import('../NovelSeeder'))
    await this.runSeeder(await import('../AnnouncementSeeder'))
    await this.runSeeder(await import('../PacketSeeder'))
    await this.runSeeder(await import('../PlanSeeder'))
    await this.runSeeder(await import('../OrderSeeder'))
  }
}
