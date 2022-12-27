import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import BaseValidator from '../BaseValidator'

export default class LoginRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.exists({ table: 'users', column: 'email' })]),
    password: schema.string({}, [rules.minLength(5)]),
  })
}
