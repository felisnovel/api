import Factory from '@ioc:Adonis/Lucid/Factory'
import Plan from 'App/Models/Plan'

export default Factory.define(Plan, ({ faker }) => {
  const amount = faker.datatype.number({ min: 1, max: 100 })

  return {
    name: amount.toString() + ' Coin',
    amount: amount,
    no_ads: false,
    discord_features: false,
    download: false,
  }
}).build()
