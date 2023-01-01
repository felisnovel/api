import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ApiToken from 'App/Models/ApiToken'
import User from 'App/Models/User'
import { randomBytes } from 'crypto'
import { promisify } from 'util'
import PasswordResetMailer from '../../../Mailers/Passwords/PasswordResetMailer'
import ForgotPasswordRequestValidator from '../../../Validators/Auth/ForgotPasswordRequestValidator'

export default class ForgotPasswordController {
  public async invoke({ request, response }: HttpContextContract) {
    const payload = await request.validate(ForgotPasswordRequestValidator)

    const user = await User.findBy('email', payload.email)

    if (!user) {
      return response.status(422).send({
        message: 'User not found',
      })
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

    await new PasswordResetMailer(user, token).send()

    return response.status(200).send({
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
    })
  }
}
