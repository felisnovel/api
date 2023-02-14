import { test } from '@japa/runner'
import InvoiceFactory from 'Database/factories/InvoiceFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

test.group('Invoices', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of invoices', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const response = await client.get('/invoices').loginAs(admin)

    response.assertStatus(200)
  })

  test('delete a invoice', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const invoice = await InvoiceFactory.with('user', 1).create()

    const response = await client.delete(`/invoices/` + invoice.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a invoice', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const invoice = await InvoiceFactory.with('user', 1).create()

    const response = await client.delete(`/invoices/` + invoice.id).loginAs(user)

    response.assertStatus(403)
  })
})
