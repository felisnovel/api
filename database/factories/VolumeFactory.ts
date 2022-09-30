import Factory from '@ioc:Adonis/Lucid/Factory'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'
import Volume from 'App/Models/Volume'
import NovelFactory from 'Database/factories/NovelFactory'

export default Factory.define(Volume, ({ faker }) => {
  return {
    name: faker.lorem.words(3),
    number: faker.datatype.number(),
    publish_status: faker.helpers.arrayElement(Object.values(VolumePublishStatus)),
  }
})
  .relation('novel', () => NovelFactory)
  .build()
