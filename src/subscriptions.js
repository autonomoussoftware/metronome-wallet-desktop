/**
 * Subscribes to a list of IPC message and dispatch a Redux action
 * of type { type: MSG_NAME, payload: MSG_ARG }
 *
 * @param {Object} store - A standard Redux store object
 * @returns {undefined}
 */
export function subscribeToMainProcessMessages(store) {
  const ipcMessages = [
    'explorer-connection-status-changed',
    'indexer-connection-status-changed',
    'metronome-token-status-updated',
    'web3-connection-status-changed',
    'attestation-threshold-updated',
    'chain-hop-start-time-updated',
    'connectivity-state-changed',
    'transactions-scan-finished',
    'transactions-scan-started',
    'converter-status-updated',
    'auction-status-updated',
    'wallet-state-changed',
    'coin-price-updated',
    'create-wallet',
    'open-wallets',
    'coin-block'
  ]

  ipcMessages.forEach(msgName =>
    window.ipcRenderer.on(msgName, (_, payload) =>
      store.dispatch({ type: msgName, payload })
    )
  )
}
