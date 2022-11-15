import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import UserGender from 'App/Enums/UserGender'

export default class RegisterRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    full_name: schema.string.nullableAndOptional({ trim: true }),
    gender: schema.enum.nullableAndOptional(Object.values(UserGender)),
    bio: schema.string.nullableAndOptional({ trim: true }),
    username: schema.string({ trim: true }, [rules.minLength(5)]),
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
      rules.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
      rules.confirmed(),
    ]),
    rules: schema.string({}, [rules.equalTo('true')]),
  })

  public messages = {
    '_password.regex': 'Parola en az 1 büyük, 1 küçük, 1 rakam, 1 özel karakter içermelidir',
  }
}
