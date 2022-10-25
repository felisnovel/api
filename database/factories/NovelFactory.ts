import Factory from '@ioc:Adonis/Lucid/Factory'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'
import Novel from 'App/Models/Novel'
import ChapterFactory from 'Database/factories/ChapterFactory'
import TagFactory from 'Database/factories/TagFactory'
import UserFactory from 'Database/factories/UserFactory'
import VolumeFactory from 'Database/factories/VolumeFactory'

export default Factory.define(Novel, ({ faker }) => {
  return {
    shorthand: faker.lorem.word(3),
    name: faker.lorem.words(3),
    image: faker.image.imageUrl(300, 500),
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
  .relation('volumes', () => VolumeFactory)
  .relation('latest_volume', () => VolumeFactory)
  .relation('chapters', () => ChapterFactory)
  .relation('tags', () => TagFactory)
  .build()
