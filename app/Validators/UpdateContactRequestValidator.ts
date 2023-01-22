import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import ContactStatus from 'App/Enums/ContactStatus'
import BaseValidator from './BaseValidator'

export default class UpdateContactRequestValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    status: schema.enum.optional(Object.values(ContactStatus)),
  })
}
