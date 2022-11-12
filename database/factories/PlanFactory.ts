import Factory from '@ioc:Adonis/Lucid/Factory'
import Plan from 'App/Models/Plan'

export default Factory.define(Plan, ({ faker }) => {
  const price = faker.datatype.number({ min: 1, max: 100 })

  return {
    name: price.toString() + ' Coin',
    price,
    amount: price,
    no_ads: false,
    discord_features: false,
    download: false,
  }
})
  // .state('admin', async (item) => {
  //  item.role = PlanRole.ADMIN
  // })
  .build()
