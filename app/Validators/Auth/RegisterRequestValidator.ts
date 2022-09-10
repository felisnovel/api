import { schema, rules } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class RegisterRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    full_name: schema.string({ trim: true }, [rules.minLength(6)]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
        caseInsensitive: true,
      }),
    ]),
    password: schema.string({}, [rules.minLength(6)]),
  });

  public messages = {};
}
