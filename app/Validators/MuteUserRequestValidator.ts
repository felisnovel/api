import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class MuteUserRequestValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    muted_at: schema.date({
      format: 'yyyy-MM-dd HH:mm:ss',
    }),
  })
}
