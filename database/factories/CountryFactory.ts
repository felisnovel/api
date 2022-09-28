import Factory from '@ioc:Adonis/Lucid/Factory'
import Country from 'App/Models/Country'

export default Factory.define(Country, ({ faker }) => {
  const selectedCountry = faker.address

  return {
    name: selectedCountry.county.toString(),
    key: selectedCountry.countryCode.name.toString(),
  }
}).build()
