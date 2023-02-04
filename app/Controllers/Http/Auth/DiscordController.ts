import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class DiscordController {
  async redirect({ response, auth, bouncer, ally }: HttpContextContract) {
    await bouncer.authorize('auth')
    const user = await auth.authenticate()

    if (user.discordId) {
      throw new Error('Discord hesabınız zaten bağlı.')
    }

    const redirectUrl = await ally.use('discord').redirectUrl()

    return response.json({
      redirectUrl,
    })
  }

  async callback({ bouncer, ally, auth, response }: HttpContextContract) {
    await bouncer.authorize('auth')
    const user = await auth.authenticate()

    const provider = ally.use('discord')

    if (provider.accessDenied()) {
      return 'Access was denied'
    }

    if (provider.hasError()) {
      return provider.getError()
    }

    const providerUser = await provider.user()

    await user.merge({
      discordId: providerUser.id,
    })
    await user.save()

    return response.json({
      success: true,
    })
  }

  async users({}: HttpContextContract) {
    const users = await User.query().whereNotNull('discordId')

    return await Promise.all(
      users.map(async (user) => {
        const subscribed = await user.subscribed()

        return {
          id: user.id,
          discord_id: user.discordId,
          isSubscribed: subscribed?.plan_id ? true : false,
          plan_id: subscribed?.plan_id || null,
        }
      })
    )
  }
}
