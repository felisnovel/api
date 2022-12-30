import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import * as fs from 'fs'
import { v4 as uuid } from 'uuid'
import UploadMediaRequestValidator from '../../Validators/UploadMediaRequestValidator'
export default class MediaController {
  async upload({ request, response }: HttpContextContract) {
    const { file } = await request.validate(UploadMediaRequestValidator)

    if (!file) {
      response.badRequest('You must send valid file.')
      return
    }

    const fileName = `${uuid()}.${file.extname}`

    const fileStream = fs.createReadStream(file.tmpPath!)

    await Drive.putStream(fileName, fileStream, {
      visibility: 'private',
      contentType: file.headers['content-type'],
    })

    return response.json({
      url: `${Env.get('CLOUDFLARE_R2')}/${fileName}`,
    })
  }
}
