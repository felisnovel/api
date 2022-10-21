import Database from '@ioc:Adonis/Lucid/Database'

export const cleanAll = async () => {
  await Database.beginGlobalTransaction()
  return async () => {
    await Database.rollbackGlobalTransaction()
  }
}
