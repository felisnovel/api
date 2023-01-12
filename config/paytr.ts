/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'

interface PaytrConfig {
  merchantId: string
  merchantKey: string
  merchantSalt: string
  merchantOidPrefix: string
  testMode: boolean
  merchantOkUrl: string
  merchantFailUrl: string
  debugOn: boolean
}

const paytrConfig: PaytrConfig = {
  merchantId: Env.get('PAYTR_MERCHANT_ID'),
  merchantKey: Env.get('PAYTR_MERCHANT_KEY'),
  merchantSalt: Env.get('PAYTR_MERCHANT_SALT'),
  merchantOidPrefix: Env.get('PAYTR_MERCHANT_OID_PREFIX'),
  testMode: Env.get('PAYTR_TEST_MODE'),
  merchantOkUrl: Env.get('PAYTR_MERCHANT_OK_URL'),
  merchantFailUrl: Env.get('PAYTR_MERCHANT_FAIL_URL'),
  debugOn: Env.get('PAYTR_DEBUG_ON'),
}

export default paytrConfig
