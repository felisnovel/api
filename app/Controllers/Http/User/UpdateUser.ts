import Hash from '@ioc:Adonis/Core/Hash'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EmailConfirmationService from 'App/Services/EmailConfirmationService'
import UpdateUserRequestValidator from '../../../Validators/UpdateUserRequestValidator'

export default class UpdateUser {
  async invoke({ auth, request, response }: HttpContextContract) {
    const user = await auth.authenticate()

    const data = await request.validate(UpdateUserRequestValidator)

    const oldPassword = request.input('old_password')

    const isEmailChanged = data.email && user.email !== data.email
    const isPasswordChanged = data.password

    if (!oldPassword) {
      if (isEmailChanged) {
        return response.status(400).send({
          message: 'E-posta adresini değiştirmek için mevcut şifrenizi girmelisiniz.',
        })
      }

      if (isPasswordChanged) {
        return response.status(400).send({
          message: 'Şifrenizi değiştirmek için mevcut şifrenizi girmelisiniz.',
        })
      }
    }

    if (oldPassword) {
      const hashValidate = await Hash.verify(user.password, request.input('old_password'))

      if (!hashValidate) {
        return response.status(400).send({
          message: 'Mevcut şifreniz yanlış.',
        })
      }
    }

    if (data.username && user.username !== data.username) {
      if (!user.username_changeable_enabled) {
        return response.status(400).send({
          message: 'Sadece bir kez kullanıcı adını değiştirebilirsiniz.',
        })
      }

      await user.merge({
        username_changeable_enabled: false,
      })
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
