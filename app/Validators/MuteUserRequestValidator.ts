import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import BaseValidator from './BaseValidator'

export default class MuteUserRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    muted_at: schema.date({
      format: 'yyyy-MM-dd HH:mm:ss',
    }),
  })
}
