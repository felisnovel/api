import Config from '@ioc:Adonis/Core/Config'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Novel from 'App/Models/Novel'
import { SitemapIndexStream } from 'sitemap'
import { getClientUrl } from '../../Helpers/index'
import Announcement from '../../Models/Announcement'
import Chapter from '../../Models/Chapter'
import SyndicationService from '../../Services/SyndicationService'

export default class SitemapController {
  public async index({ response }: HttpContextContract) {
    const urls = [
      '/sitemap_static.xml',
      '/sitemap_novels.xml',
      '/sitemap_chapters.xml',
      '/sitemap_announcements.xml',
    ]

    return SyndicationService.responseXml(
      response,
      urls.map((url) => SyndicationService.makeSitemap(`${Config.get('app.url')}${url}`)),
      new SitemapIndexStream({})
    )
  }

  public async static({ response }: HttpContextContract) {
    return SyndicationService.responseXml(response, [
      SyndicationService.make('/', 'daily', 1),
      SyndicationService.make('/sss', 'monthly', 0.8),
      SyndicationService.make('/hakkimizda', 'monthly', 0.8),
      SyndicationService.make('/iletisim', 'monthly', 0.8),
      SyndicationService.make('/gizlilik-sozlesmesi', 'monthly', 0.8),
      SyndicationService.make('/kullanici-sozlesmesi', 'monthly', 0.8),
      SyndicationService.make('/cerez-politikasi', 'monthly', 0.8),
      SyndicationService.make('/mesafeli-satis-sozlesmesi', 'monthly', 0.8),
      SyndicationService.make('/kayit', 'monthly', 0.8),
      SyndicationService.make('/giris', 'monthly', 0.8),
      SyndicationService.make('/sifremi-unuttum', 'monthly', 0.8),
    ])
  }

  public async novels({ response }: HttpContextContract) {
    const novels = await Novel.query().orderBy('name', 'asc')

    return SyndicationService.responseXml(
      response,
      novels.map((novel) =>
        SyndicationService.make(getClientUrl(`novel/${novel.slug}`), 'weekly', 0.7)
      )
    )
  }

  public async chapters({ response }: HttpContextContract) {
    const chapters = await Chapter.query().preload('novel').orderBy('created_at', 'desc')

    return SyndicationService.responseXml(
      response,
      chapters.map((chapter) =>
        SyndicationService.make(getClientUrl(chapter.getSlug()), 'weekly', 0.6)
      )
    )
  }

  public async announcements({ response }: HttpContextContract) {
    const announcements = await Announcement.query().orderBy('created_at', 'desc')

    return SyndicationService.responseXml(
      response,
      announcements.map((announcement) =>
        SyndicationService.make(getClientUrl(`duyurular/${announcement.slug}`), 'weekly', 0.6)
      )
    )
  }
}
