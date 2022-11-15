import { test } from '@japa/runner'
import UserGender from 'App/Enums/UserGender'
import UserFactory from 'Database/factories/UserFactory'
import { cleanAll } from '../utils'

const USER_EXAMPLE_DATA = {
  full_name: 'Ahmet Mehmet',
  email: 'email@felisnovel.com',
  username: 'username',
  bio: "I'm a bio",
  gender: UserGender.MALE,
}

const NEW_USER_EXAMPLE_DATA = {
  full_name: 'Yeni Ahmet Mehmet',
  email: 'newemail@felisnovel.com',
  username: 'newusername',
  bio: "Yeni I'm a bio",
  gender: UserGender.FEMALE,
}

const PASSWORD_EXAMPLE_DATA = {
  password: '1Password!',
  password_confirmation: '1Password!',
}

test.group('Auth', (group) => {
  group.each.setup(cleanAll)

  test('login', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'password' }).create()

    const response = await client.post('/auth/login').form({
      email: user.email,
      password: 'password',
    })

    response.assertStatus(200)
  })

  test('register regex validate', async ({ client }) => {
    const data = USER_EXAMPLE_DATA

    const response = await client.post(`/auth/register`).form({
      ...data,
      password: 'password',
      password_confirmation: 'password',
      rules: 'true',
    })

    response.assertBodyContains({
      errors: [
        {
          message: 'Parola en az 1 büyük, 1 küçük, 1 rakam, 1 özel karakter içermelidir',
        },
      ],
    })

    response.assertStatus(422)
  })

  test('register', async ({ client }) => {
    const data = USER_EXAMPLE_DATA

    const response = await client.post(`/auth/register`).form({
      ...data,
      ...PASSWORD_EXAMPLE_DATA,
      rules: 'true',
    })

    response.assertBodyContains({
      user: data,
    })

    response.assertStatus(200)
  })

  test('register with only email, username, password', async ({ client }) => {
    const data = {
      email: USER_EXAMPLE_DATA.email,
      username: USER_EXAMPLE_DATA.username,
    }

    const response = await client.post(`/auth/register`).form({
      ...data,
      ...PASSWORD_EXAMPLE_DATA,
      rules: 'true',
    })

    response.assertBodyContains({
      user: data,
    })

    response.assertStatus(200)
  })

  test('me', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get('/auth/me').loginAs(user)

    response.assertStatus(200)
  })

  test('not me', async ({ client }) => {
    const response = await client.get('/auth/me')

    response.assertStatus(401)
  })

  test('update profile', async ({ client }) => {
    const user = await UserFactory.create()

    const newData = NEW_USER_EXAMPLE_DATA

    const response = await client.patch(`/auth/profile`).loginAs(user).form(newData)

    response.assertBodyContains(newData)

    response.assertStatus(200)
  })
})
