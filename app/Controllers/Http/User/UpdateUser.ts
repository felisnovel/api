import Hash from '@ioc:Adonis/Core/Hash'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UpdateUserRequestValidator from '../../../Validators/UpdateUserRequestValidator'

export default class UpdateUser {
  async invoke({ auth, request, response }: HttpContextContract) {
    const user = await auth.authenticate()

    const data = await request.validate(UpdateUserRequestValidator)

    if (data.password) {
      const hashValidate = await Hash.verify(user.password, request.input('old_password'))

      if (!hashValidate) {
        return response.status(400).send({
          message: 'Old password is incorrect',
        })
      }
    }

    await user.merge(data)
    await user.save()

    return response.status(200).send(user)
  }
}
