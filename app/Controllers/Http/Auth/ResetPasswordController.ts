import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ApiToken from 'App/Models/ApiToken'
import ResetPasswordRequestValidator from 'App/Validators/Auth/ResetPasswordRequestValidator'
import { isBefore, parseISO, subHours } from 'date-fns'

export default class ResetPasswordController {
  public async invoke({ params, request, response }: HttpContextContract) {
    const payload = await request.validate(ResetPasswordRequestValidator)
    const token = await ApiToken.findByOrFail('token', params.token)
    if (!token) return response.status(410).json({ error: 'Token Invalid' })

    if (isBefore(parseISO(token.createdAt.toString()), subHours(new Date(), 2))) {
      await token.delete()
      return response.status(410).json({ message: 'Token süresi bitmiş!' })
    }

    await token.load('user')
    const user = token.user

    user.password = payload.password
    await user.save()
    await token.delete()

    return response.status(200).send({
      message: 'Şifreniz başarıyla değiştirildi.',
    })
  }
}
