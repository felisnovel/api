import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/login', 'AuthController.login')
  Route.post('/register', 'AuthController.register')

  Route.get('/:provider/redirect', 'AuthController.redirect')
  Route.get('/:provider/callback', 'AuthController.callback')
}).prefix('auth')

Route.resource('/novels', 'NovelController')
Route.resource('/volumes', 'VolumeController')
Route.resource('/tags', 'TagController')
Route.resource('/announcements', 'AnnouncementController')
Route.resource('/languages', 'LanguageController').except(['show'])
Route.resource('/countries', 'CountryController').except(['show'])
