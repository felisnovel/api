import Hash from '@ioc:Adonis/Core/Hash'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import EmailConfirmationService from 'App/Services/EmailConfirmationService'
import LoginRequestValidator from 'App/Validators/Auth/LoginRequestValidator'
import RegisterRequestValidator from 'App/Validators/Auth/RegisterRequestValidator'

export default class AuthController {
  protected allowedProviders = ['google', 'twitter', 'discord', 'facebook']

  async login({ request, response, auth }: HttpContextContract) {
    const { email, password } = await request.validate(LoginRequestValidator)

    const user = await User.query().where('email', email).first()

    if (!user) {
      return response.unauthorized({
        status: 'failure',
        message: 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.',
      })
    }

    const hashValidate = await Hash.verify(user.password, password)

    if (!hashValidate) {
      return response.unauthorized({
        status: 'failure',
        message: 'Şifrenizi yanlış girdiniz.',
      })
    }

    const token = await auth.use('api').generate(user, {
      expiresIn: '7days',
    })

    await user.loadCount('followNovels').loadCount('comments').loadCount('reviews')

    await user.serialize()

    return response.json({
      user: await getUserWithActivePlan(user),
      token,
    })
  }

  async me({ response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    await user.loadCount('followNovels').loadCount('comments').loadCount('reviews')
    await user.serialize()

    return response.json(await getUserWithActivePlan(user))
  }

  async register({ request, response, auth }: HttpContextContract) {
    const data = await request.validate(RegisterRequestValidator)

    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
    const { rules, _password, _password_confirmation, ...newData } = data

    const user = await User.create({
      password: _password,
      ...newData,
    })
    await user.serialize()

    await user.loadCount('followNovels').loadCount('comments').loadCount('reviews')

    const token = await auth.use('api').generate(user, { expiresIn: '7days' })

    await EmailConfirmationService.send(user.email)

    return response.json({
      user: await getUserWithActivePlan(user),
      token,
    })
  }
}

async function getUserWithActivePlan(user) {
  const activePlan = await user.subscribed()

  return {
    ...user.toJSON(),
    activePlan,
  }
}
