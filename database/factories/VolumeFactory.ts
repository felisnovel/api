import Factory from '@ioc:Adonis/Lucid/Factory'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'
import Volume from 'App/Models/Volume'
import NovelFactory from 'Database/factories/NovelFactory'
import ChapterFactory from './ChapterFactory'

// eslint-disable-next-line @typescript-eslint/no-inferrable-types
let volume_number: number = 0
const novelVolumes = {}

export default Factory.define(Volume, ({ faker }) => {
  return {
    name: faker.lorem.words(3),
    publish_status: faker.helpers.arrayElement(Object.values(VolumePublishStatus)),
  }
})
  .relation('novel', () => NovelFactory)
  .relation('chapters', () => ChapterFactory)
  .state('published', async (item) => {
    item.publish_status = VolumePublishStatus.PUBLISHED
  })
  .before('create', (factory, model, ctx) => {
    if (!novelVolumes[model?.volume_novel_id]) {
      novelVolumes[model?.volume_novel_id] = true
      volume_number = 0
    }
    model.volume_number = ++volume_number
  })
  .build()
