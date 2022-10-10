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
  Route.get('/followed-novels', 'User/FollowedNovelController.index')
  Route.put('/follow-novel/:novel', 'User/FollowNovel.invoke')
  Route.put('/unfollow-novel/:novel', 'User/UnfollowNovel.invoke')

  Route.get('/liked-novels', 'User/LikedNovelController.index')
  Route.put('/like-novel/:novel', 'User/LikeNovel.invoke')
  Route.put('/unlike-novel/:novel', 'User/UnlikeNovel.invoke')
}).middleware('auth')

Route.group(() => {
  Route.resource('/users', 'UserController').except(['store', 'destroy'])
}).middleware('isAdmin')

Route.resource('/novels', 'NovelController')

Route.resource('/chapters', 'ChapterController')
Route.resource('/comments', 'CommentController').except(['show'])

Route.resource('/volumes', 'VolumeController')
Route.resource('/tags', 'TagController')
Route.resource('/announcements', 'AnnouncementController')
Route.resource('/languages', 'LanguageController').except(['show'])
Route.resource('/countries', 'CountryController').except(['show'])
