import fastPasswordEntropy from 'fast-password-entropy'
import debounce from 'lodash/debounce'
import get from 'lodash/get'

import * as utils from './utils'
import keys from './keys'
import './sentry'

function createClient(createStore) {
  const reduxDevtoolsOptions = {
    // actionsBlacklist: ['price-updated$'],
    features: { dispatch: true }
    // maxAge: 100 // default: 50
  }

  const store = createStore(reduxDevtoolsOptions)

  window.ipcRenderer.on('ui-ready', (ev, payload) => {
    const debounceTime = get(payload, 'data.config.statePersistanceDebounce', 0)
    store.subscribe(
      debounce(
        function() {
          utils.forwardToMainProcess('persist-state')(store.getState())
        },
        debounceTime,
        { maxWait: 2 * debounceTime }
      )
    )
  })

  const onTermsLinkClick = () =>
    window.openLink(
      'https://github.com/autonomoussoftware/metronome-wallet-desktop/blob/develop/LICENSE'
    )

  const onHelpLinkClick = () =>
    window.openLink(
      'https://github.com/autonomoussoftware/documentation/blob/master/FAQ.md#metronome-faq'
    )

  const onExplorerLinkClick = transactionHash =>
    window.openLink(
      `https://explorer.metronome.io/transactions/${transactionHash}`
    )

  const getStringEntropy = fastPasswordEntropy

  const copyToClipboard = text => Promise.resolve(window.copyToClipboard(text))

  const onInit = () => {
    window.addEventListener('beforeunload', function() {
      utils.sendToMainProcess('ui-unload')
    })
    window.addEventListener('online', () => {
      store.dispatch({
        type: 'connectivity-state-changed',
        payload: { ok: true }
      })
    })
    window.addEventListener('offline', () => {
      store.dispatch({
        type: 'connectivity-state-changed',
        payload: { ok: false }
      })
    })
    return utils.sendToMainProcess('ui-ready')
  }

  const forwardedMethods = {
    getConvertCoinGasLimit: utils.forwardToMainProcess(
      'get-convert-coin-gas-limit'
    ),
    getConvertMetGasLimit: utils.forwardToMainProcess(
      'get-convert-met-gas-limit'
    ),
    getConvertCoinEstimate: utils.forwardToMainProcess(
      'get-convert-coin-estimate'
    ),
    getConvertMetEstimate: utils.forwardToMainProcess(
      'get-convert-met-estimate'
    ),
    refreshAllTransactions: utils.forwardToMainProcess(
      'refresh-all-transactions',
      120000
    ),
    refreshTransaction: utils.forwardToMainProcess(
      'refresh-transaction',
      120000
    ),
    onOnboardingCompleted: utils.forwardToMainProcess('onboarding-completed'),
    recoverFromMnemonic: utils.forwardToMainProcess('recover-from-mnemonic'),
    getAuctionGasLimit: utils.forwardToMainProcess('get-auction-gas-limit'),
    getTokensGasLimit: utils.forwardToMainProcess('get-tokens-gas-limit'),
    portMetronome: utils.forwardToMainProcess('port-metronome', 120000),
    validatePassword: utils.forwardToMainProcess('validate-password'),
    buyMetronome: utils.forwardToMainProcess('buy-metronome', 60000),
    convertCoin: utils.forwardToMainProcess('convert-coin', 60000),
    retryImport: utils.forwardToMainProcess('retry-import', 60000),
    convertMet: utils.forwardToMainProcess('convert-met', 60000),
    onLoginSubmit: utils.forwardToMainProcess('login-submit'),
    getPortFees: utils.forwardToMainProcess('get-port-fees'),
    getGasLimit: utils.forwardToMainProcess('get-gas-limit'),
    getGasPrice: utils.forwardToMainProcess('get-gas-price'),
    sendCoin: utils.forwardToMainProcess('send-coin', 60000),
    sendMet: utils.forwardToMainProcess('send-met', 60000),
    clearCache: utils.forwardToMainProcess('clear-cache')
  }

  const api = {
    ...utils,
    ...forwardedMethods,
    isValidMnemonic: keys.isValidMnemonic,
    createMnemonic: keys.createMnemonic,
    onExplorerLinkClick,
    onTermsLinkClick,
    getStringEntropy,
    copyToClipboard,
    onHelpLinkClick,
    getAppVersion: window.getAppVersion,
    onInit,
    store
  }

  return api
}

export default createClient
