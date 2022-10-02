import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/login', 'AuthController.login')
  Route.post('/register', 'AuthController.register')

  Route.get('/:provider/redirect', 'AuthController.redirect')
  Route.get('/:provider/callback', 'AuthController.callback')

  Route.group(() => {
    Route.get('/me', 'AuthController.me')
    Route.patch('/profile', 'AuthController.updateProfile')
  }).middleware('auth')
}).prefix('auth')

Route.group(() => {
  Route.resource('/users', 'UserController').except(['store', 'destroy'])
}).middleware('isAdmin')

Route.resource('/novels', 'NovelController')
Route.resource('/chapters', 'ChapterController')
Route.resource('/volumes', 'VolumeController')
Route.resource('/tags', 'TagController')
Route.resource('/announcements', 'AnnouncementController')
Route.resource('/languages', 'LanguageController').except(['show'])
Route.resource('/countries', 'CountryController').except(['show'])
