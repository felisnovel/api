import Factory from '@ioc:Adonis/Lucid/Factory'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'
import Novel from 'App/Models/Novel'
import ChapterFactory from 'Database/factories/ChapterFactory'
import UserFactory from 'Database/factories/UserFactory'

export default Factory.define(Novel, ({ faker }) => {
  return {
    shorthand: faker.lorem.word(3),
    name: faker.lorem.words(3),
    image: faker.image.imageUrl(),
    cover_image: faker.image.imageUrl(),
    description: faker.lorem.paragraphs(3),
    author: faker.name.findName(),
    license_holder: faker.name.findName(),
    status: faker.helpers.arrayElement(Object.values(NovelStatus)),
    publish_status: faker.helpers.arrayElement(Object.values(NovelPublishStatus)),
    translation_status: faker.helpers.arrayElement(Object.values(NovelTranslationStatus)),
    is_mature: faker.datatype.boolean(),
    is_premium: faker.datatype.boolean(),
    is_promoted: faker.datatype.boolean(),
  }
})
  .relation('editor', () => UserFactory)
  .relation('translator', () => UserFactory)
  .relation('chapters', () => ChapterFactory)
  .build()
