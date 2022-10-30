import { test } from '@japa/runner'
import CommentReportFactory from 'Database/factories/CommentReportFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

test.group('CommentReports', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of comment reports', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.get('/comments/reports').loginAs(admin)

    response.assertStatus(200)
  })

  test('delete a comment report', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const commentReport = await CommentReportFactory.create()

    const response = await client.delete(`/comments/reports/` + commentReport.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a comment report', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const commentReport = await CommentReportFactory.create()

    const response = await client.delete(`/comments/reports/` + commentReport.id).loginAs(user)

    response.assertStatus(403)
  })
})
