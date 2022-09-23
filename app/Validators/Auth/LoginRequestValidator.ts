import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class LoginRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.exists({ table: 'users', column: 'email' })]),
    password: schema.string({}, [rules.minLength(6)]),
  })

  public messages = {}
}
