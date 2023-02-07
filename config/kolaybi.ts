/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'

interface KolaybiConfig {
  apiKey: string
  apiUrl: string
  channel: string
}

const kolaybiConfig: KolaybiConfig = {
  apiKey: Env.get('KOLAYBI_API_KEY'),
  apiUrl: Env.get('KOLAYBI_API_URL'),
  channel: Env.get('KOLAYBI_CHANNEL'),
}

export default kolaybiConfig
