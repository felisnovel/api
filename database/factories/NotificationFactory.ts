import Factory from '@ioc:Adonis/Lucid/Factory'
import NotificationType from 'App/Enums/NotificationType'
import Notification from 'App/Models/Notification'
import { DateTime } from 'luxon'
import UserFactory from './UserFactory'

export default Factory.define(Notification, ({ faker }) => {
  return {
    body: faker.lorem.sentence(),
    href: faker.internet.url(),
    createdAt: DateTime.utc(),
    type: faker.helpers.arrayElement(Object.values(NotificationType)),
  }
})
  .relation('user', () => UserFactory)
  .build()
