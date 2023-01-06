import Hash from '@ioc:Adonis/Core/Hash'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import EmailConfirmationService from 'App/Services/EmailConfirmationService'
import LoginRequestValidator from 'App/Validators/Auth/LoginRequestValidator'
import RegisterRequestValidator from 'App/Validators/Auth/RegisterRequestValidator'
import { DateTime } from 'luxon'
import slugify from 'slugify'

export default class AuthController {
  protected allowedProviders = ['google', 'twitter', 'discord', 'facebook']

  async login({ request, response, auth }: HttpContextContract) {
    const { email, password } = await request.validate(LoginRequestValidator)

    const user = await User.query().where('email', email).firstOrFail()

    const hashValidate = await Hash.verify(user.password, password)

    if (!hashValidate) {
      return response.unauthorized({
        status: 'failure',
        message: 'Invalid credentials',
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

  redirect({ ally, params, response }: HttpContextContract) {
    if (!this.allowedProviders.includes(params.provider)) {
      return response.badRequest({
        status: 'failure',
        message: 'Invalid provider',
      })
    }

    return ally.use(params.provider).redirect()
  }

  async callback({ auth, ally, params, response }: HttpContextContract) {
    if (!this.allowedProviders.includes(params.provider)) {
      return response.badRequest({
        status: 'failure',
        message: 'Invalid provider',
      })
    }

    const provider = ally.use(params.provider)

    if (provider.accessDenied()) {
      return 'Access was denied'
    }

    if (provider.hasError()) {
      return provider.getError()
    }

    const providerUser = await provider.user()

    const user = await User.firstOrCreate(
      {
        email: providerUser.email,
      },
      {
        username: `${slugify(providerUser.name)}-${new Date().getTime()}`,
        confirmedAt:
          providerUser.emailVerificationState === 'verified' ? DateTime.now() : undefined,
      }
    )

    const token = await auth.use('api').generate(user, { expiresIn: '7days' })

    return response.json({
      user: await getUserWithActivePlan(user),
      token,
    })
  }
}

async function getUserWithActivePlan(user) {
  const activePlan = await user.related('subscribedPlans').query().first()

  return {
    ...user.toJSON(),
    activePlan,
  }
}
