import AnnouncementPublishStatus from 'App/Enums/AnnouncementPublishStatus'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import Comment from 'App/Models/Comment'
import Notification from 'App/Models/Notification'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import NotificationType from '../Enums/NotificationType'
import Announcement from '../Models/Announcement'
import Chapter from '../Models/Chapter'
import Order from '../Models/Order'
import Review from '../Models/Review'

export default class NotificationService {
  public static async getForDisplay(user: User | undefined, stub = false) {
    if (!user || stub)
      return {
        unread: [],
        read: [],
      }

    return {
      unread: await this.getUnread(user.id),
      read: await this.getLatestRead(user.id),
    }
  }

  public static async getUnread(userId: number) {
    return Notification.query().where({ userId }).whereNull('readAt').orderBy('createdAt', 'desc')
  }

  public static async getLatestRead(userId: number) {
    return Notification.query()
      .where({ userId })
      .whereNotNull('readAt')
      .orderBy('createdAt', 'desc')
  }

  public static async markAllAsRead(userId: number) {
    await Notification.query()
      .where({ userId })
      .whereNull('readAt')
      .update({ readAt: DateTime.utc() })
  }

  public static async onNotification({
    userId,
    initiatorUserId,
    type,
    notificationableType,
    notificationableId,
    body,
    href,
  }: {
    userId: number
    initiatorUserId?: number
    type: NotificationType
    notificationableType?: string
    notificationableId?: number
    body?: string
    href?: string
  }) {
    await Notification.create({
      userId,
      initiatorUserId,
      type,
      notificationableType,
      notificationableId,
      body,
      href,
    })
  }

  public static async onCoinAdded(user: User, order: Order) {
    await this.onNotification({
      userId: user.id,
      type: NotificationType.COIN,
      notificationableType: 'orders',
      notificationableId: order.id,
      body: `${order.amount} coin yüklendi.`,
    })
  }

  public static async onMentions({
    initiatorUserId,
    notificationableType,
    notificationableId,
    content,
    body,
  }) {
    const usernames = content.match(/@\w+/g)?.map((x) => x.substr(1))

    if (usernames) {
      const users = await User.query()
        .whereIn('username', usernames)
        .whereNot('id', initiatorUserId)

      for (const user of users) {
        await this.onNotification({
          userId: user.id,
          initiatorUserId,
          type: NotificationType.MENTION,
          notificationableType,
          notificationableId,
          body,
        })
      }
    }
  }

  public static async onCommentMentions(comment) {
    await this.onMentions({
      initiatorUserId: comment.user_id,
      notificationableType: 'comments',
      notificationableId: comment.id,
      content: comment.body,
      body: `${comment.user.username} yorumunda senden bahsetti.`,
    })
  }

  public static async onReviewMentions(review) {
    await this.onMentions({
      initiatorUserId: review.user_id,
      notificationableType: 'reviews',
      notificationableId: review.id,
      content: review.body,
      body: `${review.user.username} incelemesinde senden bahsetti.`,
    })
  }

  public static async onCommentLike(comment: Comment, initiatorUser: User) {
    await this.onNotification({
      userId: comment.user_id,
      initiatorUserId: initiatorUser.id,
      type: NotificationType.LIKE,
      notificationableType: 'comments',
      notificationableId: comment.id,
      body: `${initiatorUser.username} yorumunu beğendi.`,
    })
  }

  public static async onReviewLike(review: Review, initiatorUser: User) {
    await this.onNotification({
      userId: review.user_id,
      initiatorUserId: initiatorUser.id,
      type: NotificationType.LIKE,
      notificationableType: 'comments',
      notificationableId: review.id,
      body: `${initiatorUser.username} incelemeni beğendi.`,
    })
  }

  public static async onCommentReply(comment: Comment) {
    const parentComment = await Comment.findOrFail(comment.parent_id)
    await parentComment.load('user')

    if (comment.user_id !== parentComment.user_id) {
      await this.onNotification({
        userId: parentComment.user_id,
        initiatorUserId: comment.user.id,
        type: NotificationType.REPLY,
        notificationableType: 'comments',
        notificationableId: comment.id,
        body: `${comment.user.username} yorumuna yanıt verdi`,
      })
    }
  }

  public static async onSync({ onCreate, ...dist }) {
    const { notificationableType, body, notificationableId } = dist

    const isNotification = await Notification.query()
      .where({ notificationableType, notificationableId })
      .first()

    if (!isNotification) {
      await onCreate(dist)
    } else {
      await this.onUpdate(notificationableType, notificationableId, body)
    }
  }

  public static async onNotifications(props) {
    await this.onSync({
      onCreate: async ({ users, ...dist }) => {
        for (const user of users) {
          await this.onNotification({
            userId: user.id,
            ...dist,
          })
        }
      },
      ...props,
    })
  }

  public static async onAnnouncement(announcement: Announcement) {
    if (announcement.publish_status === AnnouncementPublishStatus.PUBLISHED) {
      const users = await User.query()

      await this.onNotifications({
        users,
        type: NotificationType.ANNOUNCEMENT,
        notificationableType: 'announcements',
        notificationableId: announcement.id,
        body: announcement.title,
      })
    }
  }

  public static async onChapter(chapter: Chapter) {
    if (chapter.publish_status === ChapterPublishStatus.PUBLISHED) {
      await chapter.load('novel')
      await chapter.load('volume')
      await chapter.novel.load('followers')

      const users = chapter.novel.followers

      await this.onNotifications({
        users,
        type: NotificationType.FOLLOW,
        notificationableType: 'chapters',
        notificationableId: chapter.id,
        body: chapter.fullName,
      })
    }
  }

  public static async onComment(comment: Comment) {
    await comment.load('user')

    await this.onCommentMentions(comment)

    if (comment.parent_id) {
      await this.onCommentReply(comment)
    }
  }

  public static async onReview(review: Review) {
    await review.load('user')

    await this.onReviewMentions(review)
  }

  public static async onUpdate(
    notificationableType: string,
    notificationableId: number,
    body: string
  ) {
    await Notification.query().where({ notificationableType, notificationableId }).update({
      body,
    })
  }

  public static async onDelete(notificationableType: string, notificationableId: number) {
    await Notification.query().where({ notificationableType, notificationableId }).delete()
  }

  public static async getChapterUrl(comment: Comment) {
    await comment.load('chapter')
    await comment.chapter.load('novel')

    return `/${comment.chapter.novel.slug}/${comment.chapter.novel.shorthand}-chapter-${comment.chapter.number}`
  }

  public static async getNovelUrl(review: Review) {
    await review.load('novel')

    return `/${review.novel.slug}`
  }

  private static truncate(string: string) {
    return string.length > 255 ? string.slice(0, 255) + '...' : string
  }
}
