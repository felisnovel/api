import Factory from '@ioc:Adonis/Lucid/Factory'
import AnnouncementCategory from 'App/Enums/AnnouncementCategory'
import Announcement from 'App/Models/Announcement'

export default Factory.define(Announcement, ({ faker }) => {
  return {
    title: faker.lorem.word(),
    content: faker.lorem.lines(5),
    category: faker.helpers.arrayElement(Object.values(AnnouncementCategory)),
  }
}).build()
