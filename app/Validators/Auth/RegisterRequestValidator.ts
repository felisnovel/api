import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import UserGender from 'App/Enums/UserGender'
import { PASSWORD_REGEX } from '../../constants/Regex'
import BaseValidator from '../BaseValidator'

export default class RegisterRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    name: schema.string.nullableAndOptional({ trim: true }),
    surname: schema.string.nullableAndOptional({ trim: true }),
    gender: schema.enum.nullableAndOptional(Object.values(UserGender)),
    bio: schema.string.nullableAndOptional({ trim: true }),
    username: schema.string({ trim: true }, [
      rules.minLength(5),
      rules.regex(/^(?=.{5,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
      rules.unique({
        table: 'users',
        column: 'username',
        caseInsensitive: true,
      }),
    ]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
        caseInsensitive: true,
      }),
    ]),
    _password: schema.string({}, [
      rules.minLength(8),
      rules.regex(PASSWORD_REGEX),
      rules.confirmed(),
    ]),
    rules: schema.string({}, [rules.equalTo('true')]),
  })
}
