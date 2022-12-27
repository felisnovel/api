import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import BaseValidator from './BaseValidator'

export default class UploadMediaRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    file: schema.file({
      size: '3mb',
      extnames: ['png', 'jpg', 'jpeg'],
    }),
  })
}
