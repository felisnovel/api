import { BaseCommand } from '@adonisjs/core/build/standalone'
import InvoiceService from 'App/Services/InvoiceService'

export default class CreateInvoiceForUser extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'create:invoice_for_users'

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
    const users = await User.query()

    for await (const user of users) {
      try {
        await new InvoiceService().createDocumentForUser(user)
      } catch (e) {
        console.log(e)
      }
    }
  }
}
