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
  Route.get('/followed', 'Novel/FollowedNovelController.invoke')
  Route.put('/:novel/follow', 'Novel/FollowNovel.invoke')
  Route.put('/:novel/unfollow', 'Novel/UnfollowNovel.invoke')

  Route.get('/liked', 'Novel/LikedNovelController.invoke')
  Route.put('/:novel/like', 'Novel/LikeNovel.invoke')
  Route.put('/:novel/unlike', 'Novel/UnlikeNovel.invoke')
})
  .middleware('auth')
  .prefix('/novels')

Route.group(() => {
  Route.resource('/favorites', 'User/FavoriteController').only(['index', 'store', 'destroy'])
})
  .prefix('/user')
  .middleware('auth')
Route.group(() => {
  Route.resource('/users', 'UserController').except(['store', 'destroy'])
}).middleware('isAdmin')

Route.get('/popular-novels', 'NovelController.popular')
Route.get('/random-novels', 'NovelController.random')
Route.get('/promoted-novels', 'NovelController.promoted')
Route.get('/last-updated-novels', 'NovelController.lastUpdated')

Route.resource('/novels', 'NovelController')
Route.resource('/reviews', 'ReviewController').except(['show'])

Route.group(() => {
  Route.put('/like', 'Review/LikeReview.invoke')
  Route.put('/dislike', 'Review/DislikeReview.invoke')
})
  .prefix('reviews/:review')
  .middleware('auth')

Route.group(() => {
  Route.put('/read', 'Chapter/ReadChapter.invoke')
  Route.put('/unread', 'Chapter/UnreadChapter.invoke')
})
  .prefix('chapters/:chapter')
  .middleware('auth')

Route.resource('/chapters', 'ChapterController')
Route.resource('/comments', 'CommentController').except(['show'])

Route.resource('/volumes', 'VolumeController')
Route.group(() => {
  Route.put('/like', 'Comment/LikeComment.invoke')
  Route.put('/dislike', 'Comment/DislikeComment.invoke')
})
  .prefix('comments/:comment')
  .middleware('auth')

Route.resource('/tags', 'TagController')
Route.resource('/announcements', 'AnnouncementController')
Route.resource('/languages', 'LanguageController').except(['show'])
Route.resource('/countries', 'CountryController').except(['show'])
