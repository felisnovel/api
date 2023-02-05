import Config from '@ioc:Adonis/Core/Config'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Feed } from 'feed'
import { getClientUrl } from '../../Helpers/index'
import Chapter from '../../Models/Chapter'

export default class FeedController {
  public async index({ params, response }: HttpContextContract) {
    const clientUrl = Config.get('app.clientUrl')
    const apiUrl = Config.get('app.url')

    const feed = new Feed({
      title: 'Felis Novel',
      description: '',
      id: clientUrl,
      link: clientUrl,
      language: 'tr',
      copyright: 'Tüm hakları saklıdır.',
      updated: new Date(),
      feedLinks: {
        json: apiUrl + '/feed/json',
        atom: apiUrl + '/feed/atom',
      },
    })

    const chapters = await Chapter.query().preload('novel').orderBy('created_at', 'desc')

    chapters.forEach((chapter) => {
      feed.addItem({
        title: chapter.fullName,
        id: getClientUrl(chapter.getSlug()),
        link: getClientUrl(chapter.getSlug()),
        description: chapter.body,
        date: chapter.createdAt.toJSDate(),
      })
    })

    const { type } = params
    if (type === 'json') {
      return response.json(feed.json1())
    } else if (type === 'atom') {
      return response.send(feed.atom1())
    } else {
      throw new Error('Invalid feed type')
    }
  }
}
