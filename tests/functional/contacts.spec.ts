import { test } from '@japa/runner'
import ContactStatus from 'App/Enums/ContactStatus'
import ContactType from 'App/Enums/ContactType'
import ContactFactory from 'Database/factories/ContactFactory'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const CONTACT_EXAMPLE_DATA = {
  name: 'Oğuzhan',
  email: 'oguzhan@felisnovel.test',
  phone: '5555555555',
  type: ContactType.QUESTION,
  message: 'Test mesajı',
}

test.group('Contacts', (group) => {
  group.each.setup(cleanAll)

  test('get a paginated list of contacts', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()

    const response = await client.get('/contacts').loginAs(admin)

    response.assertStatus(200)
  })

  test('create a contact', async ({ client }) => {
    const user = await UserFactory.create()

    const data = CONTACT_EXAMPLE_DATA

    const response = await client.post('/contacts').loginAs(user).form(data)

    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('update a contact', async ({ client }) => {
    const contact = await ContactFactory.create()
    const admin = await UserFactory.apply('admin').create()

    const newData = {
      status: ContactStatus.CLOSED,
    }

    const response = await client
      .patch(`/contacts/` + contact.id)
      .loginAs(admin)
      .form(newData)

    response.assertStatus(200)
    response.assertBodyContains(newData)
  })

  test('user cannot update a contact', async ({ client }) => {
    const contact = await ContactFactory.create()
    const user = await UserFactory.apply('user').create()

    const newData = {
      status: ContactStatus.CLOSED,
    }

    const response = await client
      .patch(`/contacts/` + contact.id)
      .loginAs(user)
      .form(newData)

    response.assertStatus(403)
  })

  test('delete a contact', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const contact = await ContactFactory.create()

    const response = await client.delete(`/contacts/` + contact.id).loginAs(admin)

    response.assertStatus(200)
  })

  test('user cannot delete a contact', async ({ client }) => {
    const user = await UserFactory.apply('user').create()
    const contact = await ContactFactory.create()

    const response = await client.delete(`/contacts/` + contact.id).loginAs(user)

    response.assertStatus(403)
  })
})
