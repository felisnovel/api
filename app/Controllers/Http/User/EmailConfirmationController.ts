import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EmailConfirmationService from 'App/Services/EmailConfirmationService'

export default class EmailConfirmationController {
  public async send({ auth, response }: HttpContextContract) {
    const user = await auth.authenticate()

    await EmailConfirmationService.send(user.email)

    return response.status(200).send({
      message: 'E-posta adresinize doğrulama bağlantısı gönderildi.',
    })
  }

  public async verify({ params, request, response }: HttpContextContract) {
    const token = params.token
    const email = request.input('email')

    if (!token || !email)
      return response.status(400).send({
        message: 'Token ve email adresi gerekli.',
      })

    await EmailConfirmationService.confirm(token, email)

    return response.status(200).send({
      message: 'E-posta adresiniz başarıyla doğrulandı.',
    })
  }
}
