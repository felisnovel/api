import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class MainSeeder extends BaseSeeder {
  private async runSeeder(seeder: { default: typeof BaseSeeder }) {
    await new seeder.default(this.client).run()
  }

  public async run() {
    await this.runSeeder(await import('../Novel'))
    await this.runSeeder(await import('../Announcement'))
    await this.runSeeder(await import('../Country'))
    await this.runSeeder(await import('../Packet'))
    await this.runSeeder(await import('../Plan'))
    await this.runSeeder(await import('../Order'))
  }
}
