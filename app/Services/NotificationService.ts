import Comment from 'App/Models/Comment'
import Notification from 'App/Models/Notification'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import NotificationType from '../Enums/NotificationType'
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
    initiatorUser,
    type,
    notificationableType,
    notificationableId,
    title,
    body,
    href,
  }: {
    userId: number
    initiatorUser?: User
    type: NotificationType
    notificationableType?: string
    notificationableId?: number
    title?: string
    body?: string
    href?: string
  }) {
    await Notification.create({
      userId,
      initiatorUserId: initiatorUser?.id,
      type,
      notificationableType,
      notificationableId,
      title,
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
      title: `${order.amount} coin yüklendi.`,
    })
  }

  public static async onMentions({
    initiatorUser,
    notificationableType,
    notificationableId,
    title,
    body,
  }) {
    const usernames = body.match(/@\w+/g).map((x) => x.substr(1))

    if (usernames) {
      const users = await User.query().whereIn('username', usernames)

      for (const user of users) {
        await this.onNotification({
          userId: user.id,
          initiatorUser,
          type: NotificationType.MENTION,
          notificationableType,
          notificationableId,
          title,
        })
      }
    }
  }

  public static async onCommentMentions(comment) {
    await this.onMentions({
      initiatorUser: comment.user,
      notificationableType: 'comments',
      notificationableId: comment.id,
      title: `${comment.user.username} yorumunda senden bahsetti.`,
      body: comment.body,
    })
  }

  public static async onReviewMentions(review) {
    await this.onMentions({
      initiatorUser: review.user,
      notificationableType: 'reviews',
      notificationableId: review.id,
      title: `${review.user.username} incelemesinde senden bahsetti.`,
      body: review.body,
    })
  }

  public static async onCommentLike(comment: Comment, initiatorUser: User) {
    await this.onNotification({
      userId: comment.user_id,
      initiatorUser: initiatorUser,
      type: NotificationType.LIKE,
      notificationableType: 'comments',
      notificationableId: comment.id,
      title: `${initiatorUser.username} yorumunu beğendi.`,
    })
  }

  public static async onReviewLike(review: Review, initiatorUser: User) {
    await this.onNotification({
      userId: review.user_id,
      initiatorUser: initiatorUser,
      type: NotificationType.LIKE,
      notificationableType: 'comments',
      notificationableId: review.id,
      title: `${initiatorUser.username} incelemeni beğendi.`,
    })
  }

  public static async onCommentReply(comment: Comment) {
    const parentComment = await Comment.findOrFail(comment.parent_id)

    await this.onNotification({
      userId: parentComment.user_id,
      initiatorUser: comment.user,
      type: NotificationType.REPLY,
      notificationableType: 'comments',
      notificationableId: comment.id,
      title: 'Yorumuna yanıt verildi.',
      body: this.truncate(comment.body),
    })
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
    await Notification.query()
      .where({ notificationableType, notificationableId })
      .update({
        body: this.truncate(body),
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
