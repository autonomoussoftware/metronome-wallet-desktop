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

  const onExplorerLinkClick = (transactionHash) =>
    shell.openExternal(`https://explorer.metronome.io/transactions/${transactionHash}`)

  const getStringEntropy = fastPasswordEntropy

  const refreshAllTransactions = () => { }

  const refreshTransaction = () => { }

  const copyToClipboard = text => Promise.resolve(clipboard.writeText(text))

  const forwardedMethods = {
    getConvertEthGasLimit: forwardToMainProcess('get-convert-eth-gas-limit'),
    getConvertMetGasLimit: forwardToMainProcess('get-convert-met-gas-limit'),
    getConvertEthEstimate: forwardToMainProcess('get-convert-eth-estimate'),
    getConvertMetEstimate: forwardToMainProcess('get-convert-met-estimate'),
    onOnboardingCompleted: forwardToMainProcess('onboarding-completed'),
    recoverFromMnemonic: forwardToMainProcess('recover-from-mnemonic'),
    getAuctionGasLimit: forwardToMainProcess('get-auction-gas-limit'),
    getTokensGasLimit: forwardToMainProcess('get-tokens-gas-limit'),
    validatePassword: forwardToMainProcess('validate-password'),
    buyMetronome: forwardToMainProcess('buy-metronome', 60000),
    convertEth: forwardToMainProcess('convert-eth', 60000),
    convertMet: forwardToMainProcess('convert-met', 60000),
    onLoginSubmit: forwardToMainProcess('login-submit'),
    getGasLimit: forwardToMainProcess('get-gas-limit'),
    getGasPrice: forwardToMainProcess('get-gas-price'),
    sendEth: forwardToMainProcess('send-eth', 60000),
    sendMet: forwardToMainProcess('send-met', 60000),
    clearCache: forwardToMainProcess('clear-cache'),
    onInit: forwardToMainProcess('ui-ready'),
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
    store
  }

  return api
}

export default createClient