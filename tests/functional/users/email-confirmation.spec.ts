import Mail from '@ioc:Adonis/Addons/Mail'
import { test } from '@japa/runner'
import { appTitle } from 'Config/app'
import UserFactory from 'Database/factories/UserFactory'
import { DateTime, Duration } from 'luxon'
import { cleanAll } from '../../utils'

test.group('Email Confirmation', (group) => {
  group.each.setup(cleanAll)

  test('it should send and email with email confirmation instructions', async ({
    assert,
    client,
  }) => {
    const user = await UserFactory.create()
    const mailer = Mail.fake()

    const response = await client.post('/email-confirmation').loginAs(user)
    await response.assertStatus(200)

    assert.isTrue(mailer.exists({ to: [{ address: user.email }] }))
    assert.isTrue(mailer.exists({ from: { address: 'noreply@felisnovel.com' } }))
    assert.isTrue(mailer.exists({ subject: `${appTitle}: E-posta Adresini Onayla` }))
    assert.isTrue(
      mailer.exists((mail) => {
        return mail.html!.includes(user.username)
      })
    )
    Mail.restore()
  })

  test('it should create a email confirmation', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const response = await client.post('/email-confirmation').loginAs(user)
    response.assertStatus(200)

    const tokens = await user.related('tokens').query()
    assert.isNotEmpty(tokens)
  })

  test('it should be able to email confirmation', async ({ client }) => {
    const user = await UserFactory.create()
    const { token } = await user
      .related('tokens')
      .create({ token: 'token', type: 'emailConfirmation', name: 'Random Bytes Token' })

    const response = await client.post(`/email-confirmation/${token}?email=${user.email}`)
    response.assertStatus(200)
  })

  test('it cannot email confirmation when token is expired after 2 hours', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    const date = DateTime.now().minus(Duration.fromISOTime('02:01'))
    const { token } = await user.related('tokens').create({
      token: 'token',
      type: 'emailConfirmation',
      name: 'Random Bytes Token',
      createdAt: date,
    })
    const response = await client.post(`/email-confirmation/${token}?email=${user.email}`)
    response.assertStatus(410)

    assert.equal(response.body().message, 'Token süresi bitmiş!')
  })
})
