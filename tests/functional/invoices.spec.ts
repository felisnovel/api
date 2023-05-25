import { test } from '@japa/runner'
import KolaybiService from 'App/Services/KolaybiService'
import InvoiceFactory from 'Database/factories/InvoiceFactory'
import UserFactory from 'Database/factories/UserFactory'
import sinon from 'sinon'
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

test.group('E-Invoices', (group) => {
  group.each.setup(cleanAll)

  test('create e-invoice', async ({ client }) => {
    const admin = await UserFactory.with('country', 1).with('city', 1).apply('admin').create()
    const invoice = await InvoiceFactory.merge({
      user_id: admin.id,
    })
      .with('orders', 3, (orderFactory) => {
        orderFactory.merge({
          user_id: admin.id,
        })
      })
      .create()

    const mock = sinon.mock(KolaybiService.prototype)
    mock.expects('getDocumentDetail').once().returns(GET_DOCUMENT_DETAIL_RESPONSE)
    mock.expects('createEInvoice').once().returns(CREATE_E_INVOICE_RESPONSE)

    const response = await client.post(`/invoices/${invoice.id}/create-e-invoice`).loginAs(admin)
    response.assertStatus(200)

    mock.verify()
    mock.restore()
  })

  /*
  test('create document', async ({ client }) => {
    const admin = await UserFactory.with('country', 1).with('city', 1).apply('admin').create()
    const invoice = await InvoiceFactory.merge({
      user_id: admin.id,
    })
      .with('orders', 3, (orderFactory) => {
        orderFactory.merge({
          user_id: admin.id,
        })
      })
      .create()

    const mock = sinon.mock(KolaybiService.prototype)
    mock.expects('getContactDetails').once().returns(GET_CONTACT_DETAILS_RESPONSE)
    mock.expects('createDocument').once().returns(CREATE_DOCUMENT_RESPONSE)
    mock.expects('getProductId').thrice().returns(1)

    const response = await client.post(`/invoices/${invoice.id}/create-document`).loginAs(admin)
    response.assertStatus(200)

    mock.verify()
    mock.restore()
  })
  */
})

const GET_CONTACT_DETAILS_RESPONSE = {
  associate: {
    id: 2393344,
    name: 'Evie',
    code: 'USR000001',
    surname: 'ahmet',
    full_name: 'Evie ahmet',
    identity_no: '11111111111',
    tax_office: null,
    associate_type: 'customer',
    phone: null,
    email: null,
    country: null,
    tags: [],
    address: [
      {
        id: 85613,
        address: '588 McLaughlin Prairie',
        country_name: 'Türkiye',
        postal_code: null,
        is_abroad: false,
        building_name: null,
        number: null,
        street: null,
        address_type: 'invoice',
        city: 'Adana',
        district: 'Feke',
      },
    ],
  },
  address: {
    id: 85613,
    address: '588 McLaughlin Prairie',
    country_name: 'Türkiye',
    postal_code: null,
    is_abroad: false,
    building_name: null,
    number: null,
    street: null,
    address_type: 'invoice',
    city: 'Adana',
    district: 'Feke',
  },
}

const CREATE_DOCUMENT_RESPONSE = {
  data: {
    id: 1,
  },
}

const GET_DOCUMENT_DETAIL_RESPONSE = {
  data: { uuid: null },
  message: 'KOLAYBI.DOCUMENT.DETAIL.SUCCESS',
  success: true,
}

const CREATE_E_INVOICE_RESPONSE = {
  data: {
    document_id: 2594200,
    uuid: '0ba031cd-26e9-4188-98d2-b33b6d51694d',
    no: 'HDA2023000000086',
    status: 'sent_to_receiver',
    scenario: 'EARSIVFATURA',
    type: 'SATIS',
    direction: 'outbound',
    exchange_grand_total: 110,
    exchange_grand_currency: 'try',
    grand_total: 110,
    grand_currency: 'try',
  },
  message: 'KOLAYBI.E_DOCUMENT.CREATE.SUCCESS',
  success: true,
}
