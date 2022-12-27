import NotificationService from 'App/Services/NotificationService'
import ReactionTypeEnum from '../Enums/ReactionTypeEnum'
import Comment from '../Models/Comment'
import CommentReaction from '../Models/CommentReaction'
import Review from '../Models/Review'
import ReviewReaction from '../Models/ReviewReaction'

const reverseReactionTypes = {
  like: 'dislike',
  dislike: 'like',
}

export async function runCommentReaction(props) {
  await runReaction({
    ...props,
    key: 'comment_id',
    model: Comment,
    modelReaction: CommentReaction,
  })
}

export async function runReviewReaction(props) {
  await runReaction({
    ...props,
    key: 'review_id',
    model: Review,
    modelReaction: ReviewReaction,
  })
}

export async function runReaction({
  user,
  id,
  key,
  value,
  model: Model,
  modelReaction: ModelReaction,
}) {
  const item = await Model.findOrFail(id)

  let reaction = await ModelReaction.query().where('user_id', user.id).where(key, item.id).first()

  const reactionType = ReactionTypeEnum[value.toUpperCase()]
  const reverseReactionType = ReactionTypeEnum[reverseReactionTypes[value].toUpperCase()]
  let event = ''
  if (!reaction) {
    reaction = await ModelReaction.create({
      [key]: item.id,
      user_id: user.id,
      type: reactionType,
    })
  } else if (reaction.type === reverseReactionType) {
    reaction.type = reactionType

    await reaction.save()
  } else {
    await reaction.delete()

    event = 'delete'
  }

  if (!event) {
    event = reactionType === ReactionTypeEnum.LIKE ? 'create' : 'delete'
  }

  if (item.user_id !== user.id) {
    const createNotificationKey = {
      review_id: 'onReviewLike',
      comment_id: 'onCommentLike',
    }[key]

    const notificationableType = {
      review_id: 'reviews',
      comment_id: 'comments',
    }[key]

    if (event === 'create') {
      await NotificationService[createNotificationKey](item, user)
    } else if (event === 'delete') {
      await NotificationService.onDelete(notificationableType, item.id, {
        type: ReactionTypeEnum.LIKE,
      })
    }
  }

  return {
    reaction,
  }
}
