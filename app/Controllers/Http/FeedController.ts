import Config from '@ioc:Adonis/Core/Config'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Feed } from 'feed'
import { getClientUrl } from '../../Helpers/index'
import Announcement from '../../Models/Announcement'
import Chapter from '../../Models/Chapter'

export default class FeedController {
  private async feed() {
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

    return feed
  }

  public async announcements({ response }: HttpContextContract) {
    const feed = await this.feed()

    const announcements = await Announcement.query().orderBy('created_at', 'desc')

    announcements.forEach((announcement) => {
      feed.addItem({
        title: announcement.title,
        id: getClientUrl('duyurular/' + announcement.slug),
        link: getClientUrl('duyurular/' + announcement.slug),
        date: announcement.createdAt.toJSDate(),
      })
    })

    return response.send(feed.atom1())
  }

  public async chapters({ response }: HttpContextContract) {
    const feed = await this.feed()

    const chapters = await Chapter.query()
      .preload('volume')
      .preload('novel')
      .orderBy('created_at', 'desc')

    chapters.forEach((chapter) => {
      feed.addItem({
        title: chapter.fullName,
        id: getClientUrl(chapter.getSlug()),
        link: getClientUrl(chapter.getSlug()),
        description: chapter.body,
        date: chapter.createdAt.toJSDate(),
      })
    })

    return response.send(feed.atom1())
  }
}
