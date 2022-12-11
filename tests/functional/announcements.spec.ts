import { test } from '@japa/runner'
import AnnouncementCategory from 'App/Enums/AnnouncementCategory'
import AnnouncementFactory from 'Database/factories/AnnouncementFactory'
import UserFactory from 'Database/factories/UserFactory'
import AnnouncementPublishStatus from '../../app/Enums/AnnouncementPublishStatus'
import NotificationType from '../../app/Enums/NotificationType'
import { cleanAll } from '../utils'

const ANNOUNCEMENT_EXAMPLE_DATA = {
  title: 'Felisnovel arkadaşları arıyor!',
  context: 'Felisnovel arkadaşları arıyor!',
  category: AnnouncementCategory.GENERAL,
  publish_status: AnnouncementPublishStatus.PUBLISHED,
}

test.group('Announcements', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of announcements', async ({ client }) => {
    const response = await client.get('/announcements')

    response.assertStatus(200)
  })

  test('create a announcement', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const data = ANNOUNCEMENT_EXAMPLE_DATA

    const response = await client.post('/announcements').loginAs(admin).form(data)

    const { context, ...otherData } = data

    response.assertStatus(200)
    response.assertBodyContains(otherData)
  })

  test('user cannot create a announcement', async ({ client }) => {
    const user = await UserFactory.apply('user').create()

    const data = ANNOUNCEMENT_EXAMPLE_DATA

    const response = await client.post('/announcements').loginAs(user).form(data)

    response.assertStatus(403)
  })

  test('show a announcement with id', async ({ client }) => {
    const announcement = await AnnouncementFactory.create()

    const response = await client.get(`/announcements/` + announcement.id)

    response.assertStatus(200)
  })

  test('show a announcement with slug', async ({ client }) => {
    const announcement = await AnnouncementFactory.create()

    const response = await client.get(`/announcements/` + announcement.slug)

    response.assertStatus(200)
  })

  test('update a announcement', async ({ client }) => {
    const announcement = await AnnouncementFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = ANNOUNCEMENT_EXAMPLE_DATA

    const response = await client
      .patch(`/announcements/` + announcement.id)
      .loginAs(admin)
      .form(newData)

    const { context, ...otherNewData } = newData

    response.assertStatus(200)
    response.assertBodyContains(otherNewData)
  })

  test('user cannot update a announcement', async ({ client }) => {
    const announcement = await AnnouncementFactory.create()
    const user = await UserFactory.apply('user').create()

    const newData = ANNOUNCEMENT_EXAMPLE_DATA

    const response = await client
      .patch(`/announcements/` + announcement.id)
      .loginAs(user)
      .form(newData)

    response.assertStatus(403)
  })

  test('delete a announcement', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const announcement = await AnnouncementFactory.create()

    const response = await client.delete(`/announcements/` + announcement.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a announcement', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const announcement = await AnnouncementFactory.create()

    const response = await client.delete(`/announcements/` + announcement.id).loginAs(user)

    response.assertStatus(403)
  })
})

test.group('Announcement Notification', (group) => {
  group.each.setup(cleanAll)

  test('new announcement notification', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const data = ANNOUNCEMENT_EXAMPLE_DATA

    await client.post(`/announcements`).form(data).loginAs(admin)

    const response = await client.get('/notifications').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      unreadNotifications: [
        {
          type: NotificationType.ANNOUNCEMENT,
          body: data.title,
        },
      ],
    })
  })
})
