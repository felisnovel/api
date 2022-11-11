import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import UserGender from 'App/Enums/UserGender'

export default class UpdateUserRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    username: schema.string.optional({ trim: true }),
    email: schema.string.optional({ trim: true }),
    bio: schema.string.optional({ trim: true }),
    gender: schema.enum.optional(Object.values(UserGender)),
    password: schema.string.optional({ trim: true }, [
      rules.maxLength(64),
      rules.confirmed('password_confirmation'),
    ]),
    facebook_handle: schema.string.optional({ trim: true }),
    twitter_handle: schema.string.optional({ trim: true }),
    instagram_handle: schema.string.optional({ trim: true }),
    youtube_handle: schema.string.optional({ trim: true }),
  })
}
