import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import UserGender from 'App/Enums/UserGender'

export default class UpdateProfileRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    full_name: schema.string.optional({ trim: true }),
    gender: schema.enum(Object.values(UserGender)),
    bio: schema.string({ trim: true }),
    email: schema.string.optional({}, [
      rules.unique({
        table: 'users',
        column: 'email',
        caseInsensitive: true,
        whereNot: { id: this.ctx.auth?.user?.id },
      }),
      rules.email(),
    ]),
    username: schema.string.optional(),
    password: schema.string.optional({}, [rules.confirmed(), rules.minLength(8)]),
  })
}
