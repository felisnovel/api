import { test } from '@japa/runner'
import ReviewReportFactory from 'Database/factories/ReviewReportFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

test.group('ReviewReports', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of review reports', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const response = await client.get('/reviews/reports').loginAs(admin)

    response.assertStatus(200)
  })

  test('delete a review report', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const reviewReport = await ReviewReportFactory.create()

    const response = await client.delete(`/reviews/reports/` + reviewReport.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a review report', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const reviewReport = await ReviewReportFactory.create()

    const response = await client.delete(`/reviews/reports/` + reviewReport.id).loginAs(user)

    response.assertStatus(403)
  })
})
