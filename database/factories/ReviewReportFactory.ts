import Factory from '@ioc:Adonis/Lucid/Factory'
import ReviewFactory from 'Database/factories/ReviewFactory'
import ReviewReport from '../../app/Models/ReviewReport'

export default Factory.define(ReviewReport, ({ faker }) => {
  return {
    body: faker.lorem.paragraph(),
  }
})
  .relation('review', () => ReviewFactory)
  .build()
