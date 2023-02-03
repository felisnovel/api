import Config from '@ioc:Adonis/Core/Config'
import Novel from 'App/Models/Novel'
import { SitemapStream } from 'sitemap'
import { createGzip } from 'zlib'
import { getClientUrl } from '../Helpers/index'

export default class SyndicationService {
  public static async getSitemapUrls(): Promise<SiteMapItem[]> {
    const novels = await Novel.query().orderBy('name', 'asc')

    /*
    const tags = await Tag.query().orderBy('name', 'asc')
    const chapters = await Chapter.query().preload('novel').orderBy('title', 'asc')
    */

    let urls: SiteMapItem[] = [
      this.make('/', 'weekly', 1.0),
      this.make('/duyurular', 'weekly', 0.3),
      this.make('/kitap-listesi', 'weekly', 0.3),
      this.make('/premium', 'weekly', 0.3),
      this.make('/iletisim', 'weekly', 0.3),
      this.make('/sss', 'weekly', 0.3),
      this.make('/hakkimizda', 'weekly', 0.3),
    ]

    novels.map(
      (novel) =>
        (urls = this.add(urls, this.map(getClientUrl(`novel/${novel.slug}`), 'weekly', 0.7)))
    )
    /*
    tags.map(
      (tag) =>
        (urls = this.add(urls, this.map(getClientUrl(`kitap-listesi/${tag.slug}`), 'weekly', 0.7)))
    )
    chapters.map(
      (chapter) => (urls = this.add(urls, this.map(getClientUrl(chapter.getSlug()), 'weekly', 0.6)))
    )
    */

    return urls
  }

  public static make(url: string, changefreq: Frequency, priority = 0.5): SiteMapItem {
    return { url, changefreq, priority }
  }

  public static makeSitemap(url: string) {
    return { url, lastmod: new Date() }
  }

  private static map(
    url: string,
    changefreq: Frequency = 'weekly',
    priority = 0.5
  ): SiteMapItem | undefined {
    return this.make(url, changefreq, priority)
  }

  private static add(urls: SiteMapItem[], conditionalAdd: SiteMapItem | undefined) {
    if (!conditionalAdd) return urls
    return [...urls, conditionalAdd]
  }

  public static async responseXml(
    response: any,
    urls,
    sitemapStream: any = new SitemapStream({ hostname: Config.get('app.clientUrl') })
  ) {
    response.header('Content-Type', 'application/xml')
    response.header('Content-Encoding', 'gzip')

    try {
      const pipeline = sitemapStream.pipe(createGzip())

      urls.map((url) => sitemapStream.write(url))

      sitemapStream.end()

      response.stream(pipeline)
    } catch (e) {
      console.error(e)
      response.status(500)
    }
  }
}
