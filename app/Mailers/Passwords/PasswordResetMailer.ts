import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import Config from '@ioc:Adonis/Core/Config'
import View from '@ioc:Adonis/Core/View'
import User from 'App/Models/User'
import { appTitle } from 'Config/app'
import mjml from 'mjml'

export default class PasswordResetMailer extends BaseMailer {
  constructor(private user: User, private token: string) {
    super()
  }

  public async prepare(message: MessageContract) {
    const link = `${Config.get('app.clientUrl')}/sifre-sifirla/${this.token}?email=${
      this.user.email
    }`

    const html = mjml(
      await View.render('emails/passwords/reset', {
        user: this.user,
        link,
        appTitle,
      })
    ).html

    message
      .subject(`${appTitle}: Şifremi Unuttum`)
      .from(Config.get('mail.from.address'), Config.get('mail.from.name'))
      .to(this.user.email)
      .html(html)
  }
}
