import Config from '@ioc:Adonis/Core/Config'
export const isString = (val) => typeof val === 'string' || val instanceof String

export const getClientUrl = (url) => {
  return `${Config.get('app.clientUrl')}/${url}`
}
