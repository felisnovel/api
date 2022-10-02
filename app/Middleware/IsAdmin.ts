export default class IsAdmin {
  public async handle({ bouncer }, next: () => Promise<void>) {
    await bouncer.authorize('isAdmin')
    await next()
  }
}
