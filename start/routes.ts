import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/email-confirmation', 'User/EmailConfirmationController.send')
}).middleware('auth')

Route.post('/email-confirmation/:token', 'User/EmailConfirmationController.verify')

Route.get('/discord/users.json', 'Auth/DiscordController.users')

Route.get('/sitemap.xml', 'SitemapController.index')
Route.get('/sitemap_static.xml', 'SitemapController.static')
Route.get('/sitemap_novels.xml', 'SitemapController.novels')
Route.get('/sitemap_chapters.xml', 'SitemapController.chapters')
Route.get('/sitemap_announcements.xml', 'SitemapController.announcements')
Route.get('/feed/chapters', 'FeedController.chapters')
Route.get('/feed/announcements', 'FeedController.announcements')

Route.group(() => {
  Route.post('/login', 'AuthController.login')
  Route.post('/register', 'AuthController.register')

  Route.post('/reset-password/:token', 'Auth/ResetPasswordController.invoke')
  Route.post('/forgot-password', 'Auth/ForgotPasswordController.invoke')

  Route.group(() => {
    Route.get('/me', 'AuthController.me')

    Route.get('/discord/redirect', 'Auth/DiscordController.redirect')
    Route.get('/discord/callback', 'Auth/DiscordController.callback')
  }).middleware('auth')
}).prefix('auth')

Route.group(() => {
  Route.get('/followed', 'Novel/FollowedNovelController.invoke')
  Route.get('/last-updated-followed', 'Novel/FollowedNovelController.invoke')
  Route.put('/:novel/follow', 'Novel/FollowNovel.invoke')
  Route.put('/:novel/unfollow', 'Novel/UnfollowNovel.invoke')

  Route.get('/liked', 'Novel/LikedNovelController.invoke')
  Route.put('/:novel/like', 'Novel/LikeNovel.invoke')
  Route.put('/:novel/unlike', 'Novel/UnlikeNovel.invoke')
})
  .middleware('auth')
  .prefix('/novels')

Route.group(() => {
  Route.get('/notifications', 'NotificationController.index')
}).middleware('auth')

Route.resource('/user/favorites', 'User/FavoriteController').only(['index', 'store', 'destroy'])

Route.group(() => {
  Route.put('/update', 'User/UpdateUser.invoke')
  Route.put('/use-promocode', 'User/UsePromocode.invoke')
})
  .prefix('/user')
  .middleware('auth')

Route.group(() => {
  Route.resource('/promocodes', 'PromocodeController')
  Route.resource('/invoices', 'InvoiceController').only(['index', 'destroy'])
  Route.resource('/comments/reports', 'CommentReportController').only(['index', 'destroy'])
  Route.resource('/reviews/reports', 'ReviewReportController').only(['index', 'destroy'])
  Route.group(() => {
    Route.put('/add-coin', 'UserController.addCoin')
    Route.put('/mute-user', 'UserController.muteUser')
    Route.put('/unmute-user', 'UserController.unmuteUser')
  }).prefix('/users/:id')
  Route.put('/media/upload', 'MediaController.upload')

  Route.group(() => {
    Route.get('/coins', 'Report/CoinReport.invoke')
    Route.get('/reads', 'Report/ReadReport.invoke')
  }).prefix('reports')
}).middleware('isAdmin')

Route.resource('/users', 'UserController').except(['store', 'destroy'])

Route.get('/popular-novels', 'NovelController.popular')
Route.get('/random-novels', 'NovelController.random')
Route.get('/promoted-novels', 'NovelController.promoted')
Route.get('/last-updated-novels', 'NovelController.lastUpdated')
Route.get('/last-novels', 'NovelController.lastNovels')

Route.post('/orders/callback', 'OrderController.callback')

Route.group(() => {
  Route.group(() => {
    Route.put('/purchase', 'Packet/PurchasePacket.invoke')
  }).prefix('packets/:packet')

  Route.group(() => {
    Route.put('/subscribe', 'Plan/SubscribePlan.invoke')
  }).prefix('plans/:plan')
}).middleware('auth')

Route.resource('/plans', 'PlanController').except(['show'])
Route.resource('/packets', 'PacketController')
Route.resource('/orders', 'OrderController').only(['index', 'destroy'])

Route.resource('/novels', 'NovelController')
Route.get('/novels/:slug/og-image', 'NovelController.ogImage')

Route.resource('/reviews', 'ReviewController').except(['show'])
Route.resource('/contacts', 'ContactController').except(['show'])

Route.group(() => {
  Route.group(() => {
    Route.put('/like', 'Review/LikeReview.invoke')
    Route.put('/dislike', 'Review/DislikeReview.invoke')
    Route.put('/set-pinned', 'Review/SetPinnedReview.invoke')

    Route.put('/report', 'Review/ReportReview.invoke')
  }).prefix('/reviews/:review')

  Route.group(() => {
    Route.put('/read', 'Chapter/ReadChapter.invoke')
    Route.put('/unread', 'Chapter/UnreadChapter.invoke')
    Route.put('/purchase', 'Chapter/PurchaseChapter.invoke')
  }).prefix('/chapters/:chapter')
}).middleware('auth')

Route.resource('/chapters', 'ChapterController')

Route.resource('/comments', 'CommentController').except(['show'])

Route.resource('/volumes', 'VolumeController').only(['store', 'update', 'destroy'])
Route.group(() => {
  Route.put('/like', 'Comment/LikeComment.invoke')
  Route.put('/dislike', 'Comment/DislikeComment.invoke')
  Route.put('/set-pinned', 'Comment/SetPinnedComment.invoke')

  Route.put('/report', 'Comment/ReportComment.invoke')
})
  .prefix('comments/:comment')
  .middleware('auth')

Route.resource('/tags', 'TagController')
Route.resource('/announcements', 'AnnouncementController')
Route.resource('/languages', 'LanguageController').except(['show'])
Route.resource('/countries', 'CountryController').except(['show'])
