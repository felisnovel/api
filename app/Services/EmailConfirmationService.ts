import HttpException from 'App/Exceptions/HttpException'
import EmailConfirmationMailer from 'App/Mailers/Users/EmailConfirmationMailer'
import ApiToken from 'App/Models/ApiToken'
import User from 'App/Models/User'
import { randomBytes } from 'crypto'
import { isBefore, parseISO, subHours } from 'date-fns'
import { DateTime } from 'luxon'
import { promisify } from 'util'

export default class EmailConfirmationService {
  public static async send(email) {
    const user = await User.findBy('email', email)

    if (!user) {
      throw new HttpException('Üye bilgisi bulunamadı!', 404)
    }

    if (user.confirmedAt) {
      throw new HttpException('Zaten e-posta adresiniz doğrulanmış!', 400)
    }

    const random = await promisify(randomBytes)(3)
    const token = random.toString('hex').toUpperCase()

    ApiToken.updateOrCreate(
      { userId: user.id, type: 'forgotPassword', name: 'Random Bytes Token' },
      {
        token,
        type: 'forgotPassword',
        name: 'Random Bytes Token',
      }
    )

    new EmailConfirmationMailer(user, token).sendLater()
  }

  public static async confirm(token, email) {
    const user = await User.query().where('email', email).first()

    if (!user) {
      throw new HttpException('Üye bilgisi bulunamadı!', 404)
    }

    if (user.confirmedAt) {
      throw new HttpException('E-posta adresiniz zaten doğrulanmış!', 400)
    }

    const apiToken = await ApiToken.query()
      .where('token', token)
      .where('user_id', user.id)
      .firstOrFail()

    if (!apiToken) {
      throw new HttpException('Hatalı token!', 410)
    }

    if (isBefore(parseISO(apiToken.createdAt.toString()), subHours(new Date(), 2))) {
      await apiToken.delete()

      throw new HttpException('Token süresi bitmiş!', 410)
    }

    user.confirmedAt = DateTime.utc()
    await user.save()
    await apiToken.delete()

    return true
  }
}
