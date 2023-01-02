import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { PASSWORD_REGEX } from 'App/constants/Regex'
import BaseValidator from '../BaseValidator'

export default class ResetPasswordRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    password: schema.string.optional({}, [
      rules.minLength(8),
      rules.regex(PASSWORD_REGEX),
      rules.confirmed(),
    ]),
  })
}
