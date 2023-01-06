import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { isString } from 'App/Helpers'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new HttpException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class HttpException extends Exception {
  constructor(message: string, status = 404, code?: string) {
    super(message, status, code)
  }

  public async handle(_, { response }: HttpContextContract) {
    const content = isString(this.message) ? { message: this.message } : this.message

    return response.status(this.status).send(content)
  }
}
