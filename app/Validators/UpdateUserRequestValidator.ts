import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import UserGender from 'App/Enums/UserGender'
import UserRole from 'App/Enums/UserRole'
import { PASSWORD_REGEX } from '../constants/Regex'
import BaseValidator from './BaseValidator'

export default class UpdateUserRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    email: schema.string.optional({}, [
      rules.unique({
        table: 'users',
        column: 'email',
        caseInsensitive: true,
        whereNot: { id: this.ctx.auth.user?.id },
      }),
      rules.email(),
    ]),
    password: schema.string.optional({}, [
      rules.minLength(8),
      rules.regex(PASSWORD_REGEX),
      rules.confirmed(),
    ]),
    full_name: schema.string.optional({ trim: true }),
    bio: schema.string.optional(),
    gender: schema.enum.optional(Object.values(UserGender)),
    role: schema.enum.optional(Object.values(UserRole)),
    facebook_handle: schema.string.optional(),
    twitter_handle: schema.string.optional(),
    instagram_handle: schema.string.optional(),
    youtube_handle: schema.string.optional(),
  })
}
