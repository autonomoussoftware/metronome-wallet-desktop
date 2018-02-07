import { createActions } from 'redux-actions'

/**
 * UI-originated actions
 * For Main Proccess originated actions refer to ./subscriptions.js
 */

export default createActions({
  'recover-from-mnemonic': [mnemonic => mnemonic, () => ({ ipc: true })]
})
