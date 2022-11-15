import Factory from '@ioc:Adonis/Lucid/Factory'
import NovelPublishStatus from 'App/Enums/NovelPublishStatus'
import NovelStatus from 'App/Enums/NovelStatus'
import NovelTranslationStatus from 'App/Enums/NovelTranslationStatus'
import Novel from 'App/Models/Novel'
import ChapterFactory from 'Database/factories/ChapterFactory'
import CountryFactory from 'Database/factories/CountryFactory'
import ReviewFactory from 'Database/factories/ReviewFactory'
import TagFactory from 'Database/factories/TagFactory'
import UserFactory from 'Database/factories/UserFactory'
import VolumeFactory from 'Database/factories/VolumeFactory'

export default Factory.define(Novel, async ({ faker }) => {
  const isPremium = faker.datatype.boolean()

  return {
    shorthand: faker.lorem.word(3),
    name: faker.lorem.words(3),
    other_names: faker.lorem.words(3),
    image: faker.image.imageUrl(300, 500),
    cover_image: faker.image.imageUrl(),
    description: faker.lorem.paragraphs(3),
    author: faker.name.findName(),
    license_holder: faker.name.findName(),
    status: faker.helpers.arrayElement(Object.values(NovelStatus)),
    publish_status: faker.helpers.arrayElement(Object.values(NovelPublishStatus)),
    translation_status: faker.helpers.arrayElement(Object.values(NovelTranslationStatus)),
    is_mature: faker.datatype.boolean(),
    is_premium: isPremium,
    coin_amount: faker.datatype.number(10),
    free_amount: faker.datatype.number(5),
    is_promoted: faker.datatype.boolean(),
    editor: faker.name.findName(),
    translator: faker.name.findName(),
  }
})
  .relation('country', () => CountryFactory)
  .relation('volumes', () => VolumeFactory)
  .relation('latest_volume', () => VolumeFactory)
  .relation('chapters', () => ChapterFactory)
  .relation('reviews', () => ReviewFactory)
  .relation('tags', () => TagFactory)
  .relation('user', () => UserFactory)
  .state('published', async (item) => {
    item.publish_status = NovelPublishStatus.PUBLISHED
  })
  .state('unpublished', async (item) => {
    item.publish_status = NovelPublishStatus.UNPUBLISHED
  })
  .build()
