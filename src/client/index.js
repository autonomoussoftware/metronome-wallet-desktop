import fastPasswordEntropy from 'fast-password-entropy'
import keys from './keys'
import * as utils from './utils'
import './sentry'

function createClient(createStore) {
  const reduxDevtoolsOptions = {
    // actionsBlacklist: ['price-updated$'],
    features: { dispatch: true },
    maxAge: 100 // default: 50
  }

  const store = createStore(reduxDevtoolsOptions)

  store.subscribe(function() {
    utils.forwardToMainProcess('persist-state')(store.getState())
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

  const refreshAllTransactions = () => {}

  const refreshTransaction = () => {}

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
    onOnboardingCompleted: utils.forwardToMainProcess('onboarding-completed'),
    recoverFromMnemonic: utils.forwardToMainProcess('recover-from-mnemonic'),
    getAuctionGasLimit: utils.forwardToMainProcess('get-auction-gas-limit'),
    getTokensGasLimit: utils.forwardToMainProcess('get-tokens-gas-limit'),
    portMetronome: utils.forwardToMainProcess('port-metronome', 60000),
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
    refreshAllTransactions,
    onExplorerLinkClick,
    refreshTransaction,
    onTermsLinkClick,
    getStringEntropy,
    copyToClipboard,
    onHelpLinkClick,
    onInit,
    store
  }

  return api
}

export default createClient
