import Factory from '@ioc:Adonis/Lucid/Factory'
import ChapterPublishStatus from 'App/Enums/ChapterPublishStatus'
import Chapter from 'App/Models/Chapter'
import CommentFactory from 'Database/factories/CommentFactory'
import NovelFactory from 'Database/factories/NovelFactory'
import UserFactory from 'Database/factories/UserFactory'
import VolumeFactory from 'Database/factories/VolumeFactory'

export default Factory.define(Chapter, ({ faker }) => {
  return {
    title: faker.lorem.word(3),
    number: faker.datatype.number({ min: 1, max: 100 }),
    context: faker.lorem.paragraphs(3),
    translation_note: faker.lorem.paragraphs(1),
    is_mature: faker.datatype.boolean(),
    is_premium: faker.datatype.boolean(),
    publish_status: faker.helpers.arrayElement(Object.values(ChapterPublishStatus)),
  }
})
  .relation('novel', () => NovelFactory)
  .relation('volume', () => VolumeFactory)
  .relation('translator', () => UserFactory)
  .relation('editor', () => UserFactory)
  .relation('readUsers', () => UserFactory)
  .relation('comments', () => CommentFactory)
  .state('published', async (item) => {
    item.publish_status = ChapterPublishStatus.PUBLISHED
  })
  .build()
