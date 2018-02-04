import { createActions } from 'redux-actions'

/**
 * UI-originated actions
 * For Main Proccess originated actions refer to ./subscriptions.js
 */

export default createActions({
  'onboarding-completed': [
    ({ password, mnemonic }) => ({ password, mnemonic }),
    () => ({ ipc: true })
  ],
  'active-wallet-changed': newAddress => newAddress
})
