import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import UserGender from 'App/Enums/UserGender'
import UserRole from 'App/Enums/UserRole'

export default class UserRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    bio: schema.string.optional(),
    gender: schema.enum.optional(Object.values(UserGender)),
    full_name: schema.string.optional({ trim: true }),
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
    role: schema.enum.optional(Object.values(UserRole)),
    facebook_handle: schema.string.optional(),
    twitter_handle: schema.string.optional(),
    instagram_handle: schema.string.optional(),
    youtube_handle: schema.string.optional(),
  })
}
