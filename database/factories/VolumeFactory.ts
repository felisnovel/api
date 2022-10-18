import Factory from '@ioc:Adonis/Lucid/Factory'
import VolumePublishStatus from 'App/Enums/VolumePublishStatus'
import Volume from 'App/Models/Volume'
import NovelFactory from 'Database/factories/NovelFactory'

export default Factory.define(Volume, ({ faker }) => {
  return {
    name: faker.lorem.words(3),
    volume_number: faker.datatype.number({ min: 1, max: 100 }),
    publish_status: faker.helpers.arrayElement(Object.values(VolumePublishStatus)),
  }
})
  .relation('novel', () => NovelFactory)
  .build()
