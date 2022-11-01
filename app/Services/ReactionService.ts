import ReactionTypeEnum from '../Enums/ReactionTypeEnum'
import Comment from '../Models/Comment'
import CommentReaction from '../Models/CommentReaction'
import Review from '../Models/Review'
import ReviewReaction from '../Models/ReviewReaction'

const reverseReactionType = {
  like: 'dislike',
  dislike: 'like',
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

  if (!reaction) {
    reaction = await ModelReaction.create({
      [key]: item.id,
      user_id: user.id,
      type: reactionType,
    })
  } else if (reaction.type === ReactionTypeEnum[reverseReactionType[value].toUpperCase()]) {
    reaction.type = reactionType
    await reaction.save()
  }
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
