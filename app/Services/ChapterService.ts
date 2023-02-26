import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'
import Chapter from '../Models/Chapter'
import User from '../Models/User'
export default class ChapterService {
  public static async getPrevChapter(chapter: Chapter, options = {}) {
    const defaultOptions = {
      isPublished: true,
      isPurchased: undefined,
      isPremium: undefined,
      userId: undefined,
    }

    const { isPublished, userId, isPurchased } = { ...defaultOptions, ...options }

    const prevChapterQuery = chapter.novel.related('chapters').query()

    prevChapterQuery
      .where(function (query) {
        query.where('volume_id', '!=', chapter.volume_id).orWhere(function (orQuery) {
          orQuery.where('number', '<', chapter.number)
        })
      })
      .leftJoin('volumes', 'volumes.id', 'chapters.volume_id')
      .where('volumes.volume_number', '<=', chapter.volume.volume_number)
      .select('chapters.*')
      .orderBy('volumes.volume_number', 'desc')
      .orderBy('number', 'desc')

    if (isPublished) {
      prevChapterQuery
        .where('volumes.publish_status', VolumePublishStatus.PUBLISHED)
        .where('chapters.publish_status', ChapterPublishStatus.PUBLISHED)
    }

    if (userId && isPurchased === false) {
      prevChapterQuery.where('chapters.is_premium', true).whereNotExists(function (query) {
        query
          .from('orders')
          .whereRaw('orders.chapter_id = chapters.id')
          .where('orders.user_id', userId)
      })
    }

    const prevChapter = await prevChapterQuery.first()

    return prevChapter
  }

  public static async getNextChapter(chapter: Chapter, options = {}) {
    const defaultOptions = {
      isPublished: true,
    }

    const { isPublished } = { ...defaultOptions, ...options }

    const nextChapterQuery = chapter.novel.related('chapters').query()

    nextChapterQuery
      .where(function (query) {
        query.where('volume_id', '!=', chapter.volume_id).orWhere(function (orQuery) {
          orQuery.where('number', '>', chapter.number)
        })
      })
      .leftJoin('volumes', 'volumes.id', 'chapters.volume_id')
      .where('volumes.volume_number', '>=', chapter.volume.volume_number)
      .select('chapters.*')
      .orderBy('volumes.volume_number', 'asc')
      .orderBy('number', 'asc')

    if (isPublished) {
      nextChapterQuery
        .where('volumes.publish_status', VolumePublishStatus.PUBLISHED)
        .where('chapters.publish_status', ChapterPublishStatus.PUBLISHED)
    }

    const nextChapter = await nextChapterQuery.first()

    return nextChapter
  }

  public static async isAvailableFreeBuyableOfChapter(
    chapter: Chapter,
    user: User
  ): Promise<boolean> {
    if (chapter.is_premium === false) {
      return false
    }

    const isPurchased = await chapter.isPurchased(user)
    if (isPurchased) {
      return false
    }

    const prevChapter = await ChapterService.getPrevChapter(chapter, {
      isPurchased: false,
      userId: user.id,
    })

    if (!prevChapter) {
      return true
    }

    return false
  }
}
