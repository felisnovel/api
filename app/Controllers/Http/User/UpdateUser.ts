import Hash from '@ioc:Adonis/Core/Hash'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EmailConfirmationService from 'App/Services/EmailConfirmationService'
import UpdateUserRequestValidator from '../../../Validators/UpdateUserRequestValidator'

export default class UpdateUser {
  async invoke({ auth, request, response }: HttpContextContract) {
    const user = await auth.authenticate()

    const data = await request.validate(UpdateUserRequestValidator)

    const oldPassword = request.input('old_password')

    const isEmailChanged = user.email !== data.email

    if (data.email && !oldPassword && isEmailChanged) {
      return response.status(400).send({
        message: 'E-posta adresini değiştirmek için mevcut şifrenizi girmelisiniz.',
      })
    }

    if (oldPassword) {
      const hashValidate = await Hash.verify(user.password, request.input('old_password'))

      if (!hashValidate) {
        return response.status(400).send({
          message: 'Mevcut şifreniz yanlış.',
        })
      }
    }

    await user.merge(data)
    await user.save()

    if (isEmailChanged) {
      await user.merge({ confirmedAt: null })
      await user.save()

      await EmailConfirmationService.send(data.email)
    }

    return response.status(200).send(user)
  }
}
