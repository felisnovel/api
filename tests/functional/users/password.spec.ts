import Mail from '@ioc:Adonis/Addons/Mail'
import Hash from '@ioc:Adonis/Core/Hash'
import { test } from '@japa/runner'
import { appTitle } from 'Config/app'
import UserFactory from 'Database/factories/UserFactory'
import { DateTime, Duration } from 'luxon'
import { cleanAll } from '../../utils'
const EXAMPLE_PASSWORD = 'Gf4n5gu$'
test.group('Passwords', (group) => {
  group.each.setup(cleanAll)

  test('it should send and email with forgot password instructions', async ({ assert, client }) => {
    const user = await UserFactory.create()
    const mailer = Mail.fake()

    const response = await client.post('/auth/forgot-password').json({ email: user.email })
    await response.assertStatus(200)

    assert.isTrue(mailer.exists({ to: [{ address: user.email }] }))
    assert.isTrue(mailer.exists({ from: { address: 'noreply@felisnovel.com' } }))
    assert.isTrue(mailer.exists({ subject: `${appTitle}: Şifremi Unuttum` }))
    assert.isTrue(
      mailer.exists((mail) => {
        return mail.html!.includes(user.username)
      })
    )
    Mail.restore()
  })

  test('it should create a reset password token', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const response = await client.post('/auth/forgot-password').json({ email: user.email })
    response.assertStatus(200)

    const tokens = await user.related('tokens').query()
    assert.isNotEmpty(tokens)
  })

  test('it should be able to reset password', async ({ assert, client }) => {
    const user = await UserFactory.create()
    const { token } = await user
      .related('tokens')
      .create({ token: 'token', type: 'forgotPassword', name: 'Random Bytes Token' })
    const response = await client
      .post('/auth/reset-password/' + token)
      .json({ password: EXAMPLE_PASSWORD, password_confirmation: EXAMPLE_PASSWORD })
    response.assertStatus(200)
    await user.refresh()

    const checkPassword = await Hash.verify(user.password, EXAMPLE_PASSWORD)
    assert.isTrue(checkPassword)
  })

  test('it cannot reset password when token is expired after 2 hours', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    const date = DateTime.now().minus(Duration.fromISOTime('02:01'))
    const { token } = await user.related('tokens').create({
      token: 'token',
      type: 'forgotPassword',
      name: 'Random Bytes Token',
      createdAt: date,
    })
    const response = await client
      .post('/auth/reset-password/' + token)
      .json({ password: EXAMPLE_PASSWORD, password_confirmation: EXAMPLE_PASSWORD })
    response.assertStatus(410)
    assert.equal(response.body().message, 'Token süresi bitmiş!')
  })
})
