export function subscribeToMainProcessMessages(store) {
  const ipcMessages = [
    'metronome-token-status-updated',
    'web3-connection-status-changed',
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

  // Subscribe to every IPC message defined above and dispatch a
  // Redux action of type { type: MSG_NAME, payload: MSG_ARG }
  ipcMessages.forEach(msgName =>
    window.ipcRenderer.on(msgName, (_, payload) =>
      store.dispatch({ type: msgName, payload })
    )
  )
}
