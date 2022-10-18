import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import UserGender from 'App/Enums/UserGender'

export default class RegisterRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    full_name: schema.string.nullable({ trim: true }),
    gender: schema.enum.nullable(Object.values(UserGender)),
    bio: schema.string.nullable({ trim: true }),
    username: schema.string({ trim: true }, [rules.minLength(5)]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
        caseInsensitive: true,
      }),
    ]),
    password: schema.string({}, [rules.minLength(5)]),
  })

  public messages = {}
}
