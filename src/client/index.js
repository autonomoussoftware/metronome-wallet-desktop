import fastPasswordEntropy from 'fast-password-entropy'
import { forwardToMainProcess } from '../utils'
import keys from './keys'
import * as utils from './utils'

const { clipboard, shell } = window.require('electron')

function createClient(config, createStore) {
  const reduxDevtoolsOptions = {
    actionsBlacklist: ['price-updated$'],
    features: { dispatch: true },
    maxAge: 100 // default: 50
  }

  const store = createStore(
    reduxDevtoolsOptions,
    { config }
  )
  const onTermsLinkClick = () =>
    shell.openExternal('https://github.com/autonomoussoftware/metronome-wallet-desktop/blob/develop/LICENSE')

  const onHelpLinkClick = () =>
    shell.openExternal('https://github.com/autonomoussoftware/documentation/blob/master/FAQ.md#metronome-faq')

  const getStringEntropy = str =>
    fastPasswordEntropy(str)

  const refreshAllTransactions = () => { }

  const copyToClipboard = text => Promise.resolve(clipboard.writeText(text))

  const validatePassword = () => true

  const forwardedMethods = {
    onOnboardingCompleted: forwardToMainProcess('onboarding-completed'),
    onLoginSubmit: forwardToMainProcess('login-submit'),
    onInit: forwardToMainProcess('ui-ready'),
    getGasLimit: forwardToMainProcess('get-gas-limit'),
    getGasPrice: forwardToMainProcess('get-gas-price'),
    sendEth: forwardToMainProcess('send-eth', 60000),
    sendMet: forwardToMainProcess('send-met', 60000),
    getTokensGasLimit: forwardToMainProcess('get-tokens-gas-limit'),
    getAuctionGasLimit: forwardToMainProcess('get-auction-gas-limit'),
    getConvertEthEstimate: forwardToMainProcess('get-convert-eth-estimate'),
    getConvertEthGasLimit: forwardToMainProcess('get-convert-eth-gas-limit'),
    getConvertMetEstimate: forwardToMainProcess('get-convert-met-estimate'),
    getConvertMetGasLimit: forwardToMainProcess('get-convert-met-gas-limit'),
    buyMetronome: forwardToMainProcess('buy-metronome', 60000),
    convertEth: forwardToMainProcess('convert-eth', 60000),
    convertMet: forwardToMainProcess('convert-met', 60000),
    recoverFromMnemonic: forwardToMainProcess('recover-from-mnemonic')
  }

  const api = {
    ...utils,
    ...forwardedMethods,
    isValidMnemonic: keys.isValidMnemonic,
    createMnemonic: keys.createMnemonic,
    refreshAllTransactions,
    onTermsLinkClick,
    validatePassword,
    getStringEntropy,
    copyToClipboard,
    onHelpLinkClick,
    store
  }

  return api
}

export default createClient