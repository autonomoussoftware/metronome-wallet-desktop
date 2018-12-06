import fastPasswordEntropy from 'fast-password-entropy'
import { sendToMainProcess } from '../utils'

// const { ipcRenderer } = window.require('electron')

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
    sendToMainProcess('onbording-completed', { mnemonic, password })

  const onTermsLinkClick = () => { }

  const getStringEntropy = str =>
    fastPasswordEntropy(str)

  const onLoginSubmit = () =>
    Promise.resolve()

  const isValidMnemonic = (mnemonic) => sendToMainProcess('validate-mnemonic', { mnemonic })

  const createMnemonic = () => sendToMainProcess('create-mnemonic')

  const api = {
    isValidMnemonic,
    createMnemonic,
    onInit,
    onOnboardingCompleted,
    onLoginSubmit,
    onTermsLinkClick,
    getStringEntropy,
    store
  }

  return api
}

export default createClient