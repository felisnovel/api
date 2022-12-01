import Factory from '@ioc:Adonis/Lucid/Factory'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import Chapter from 'App/Models/Chapter'
import CommentFactory from 'Database/factories/CommentFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import UserFactory from 'Database/factories/UserFactory'
import VolumeFactory from 'Database/factories/VolumeFactory'

let number = 0
const novelChapters = {}

export default Factory.define(Chapter, ({ faker }) => {
  return {
    title: faker.lorem.word(3),
    context: faker.lorem.paragraphs(10),
    translation_note: faker.lorem.paragraphs(1),
    is_mature: faker.datatype.boolean(),
    is_premium: faker.datatype.boolean(),
    publish_status: faker.helpers.arrayElement(Object.values(ChapterPublishStatus)),
    editor: faker.name.fullName(),
    translator: faker.name.fullName(),
  }
})
  .relation('novel', () => NovelFactory)
  .relation('volume', () => VolumeFactory)
  .relation('readUsers', () => UserFactory)
  .relation('comments', () => CommentFactory)
  .state('published', async (item) => {
    item.publish_status = ChapterPublishStatus.PUBLISHED
  })
  .before('create', (factory, model, ctx) => {
    if (!novelChapters[model?.novel_id]) {
      novelChapters[model?.novel_id] = true
      number = 0
    }
    model.number = ++number
  })
  .build()
