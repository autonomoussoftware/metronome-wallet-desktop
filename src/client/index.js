import fastPasswordEntropy from 'fast-password-entropy'
import { sendToMainProcess } from '../utils'
import keys from './keys'
import * as utils from './utils'

const { shell } = window.require('electron')

function createClient(config, createStore) {
  const reduxDevtoolsOptions = {
    // actionsBlacklist: ['price-updated$'],
    features: { dispatch: true },
    maxAge: 100 // default: 50
  }

  const store = createStore(
    reduxDevtoolsOptions,
    { config }
  )

  const onInit = () =>
    sendToMainProcess('ui-ready')

  const onOnboardingCompleted = ({ mnemonic, password }) =>
    sendToMainProcess('onboarding-completed', { mnemonic, password })

  const onTermsLinkClick = () =>
    shell.openExternal('https://github.com/autonomoussoftware/metronome-wallet-desktop/blob/develop/LICENSE')

  const onHelpLinkClick = () =>
    shell.openExternal('https://github.com/autonomoussoftware/documentation/blob/master/FAQ.md#metronome-faq')

  const getStringEntropy = str =>
    fastPasswordEntropy(str)

  const onLoginSubmit = ({ password }) =>
    sendToMainProcess('login-submit', { password })

  const refreshAllTransactions = () => { }

  const copyToClipboard = () => { }

  const api = {
    ...utils,
    isValidMnemonic: keys.isValidMnemonic,
    createMnemonic: keys.createMnemonic,
    refreshAllTransactions,
    onOnboardingCompleted,
    onTermsLinkClick,
    getStringEntropy,
    copyToClipboard,
    onHelpLinkClick,
    onLoginSubmit,
    onInit,
    store
  }

  return api
}

export default createClient