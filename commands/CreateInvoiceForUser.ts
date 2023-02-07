import { args, BaseCommand } from '@adonisjs/core/build/standalone'
import KolaybiService from 'App/Services/KolaybiService'

export default class CreateInvoiceForUser extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'create:invoice_for_user'

  @args.string({ description: '' })
  public userId: string

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    const { default: User } = await import('App/Models/User')
    const user = await User.findOrFail(this.userId)
    await new KolaybiService().createInvoiceForUser(user)
  }
}
