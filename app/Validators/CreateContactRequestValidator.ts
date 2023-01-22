import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import ContactType from 'App/Enums/ContactType'
import BaseValidator from './BaseValidator'

export default class CreateContactRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.required(),
      rules.minLength(3),
      rules.maxLength(255),
    ]),
    email: schema.string.optional({ trim: true }, [rules.email(), rules.maxLength(255)]),
    phone: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    type: schema.enum.optional(Object.values(ContactType)),
    message: schema.string({ trim: true }, [
      rules.required(),
      rules.minLength(3),
      rules.maxLength(255),
    ]),
  })
}
