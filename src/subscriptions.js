import { toast } from '../src/components/common/Toasts'

export const subscribeToMainProcessMessages = store => {
  /**
   * Subscribe to an array of IPC messages and dispatch a Redux
   * action of type { type: MSG_CHANNEL, payload: MSG_ARG }
   */
  subscribeTo([
    'metronome-token-status-updated',
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
  ])

  const errorsMap = {}

  window.ipcRenderer.on('error', (ev, { error }) => {
    if (!toast.isActive(errorsMap[error.message])) {
      errorsMap[error.message] = toast.error(error.message)
    }
  })

  /*
   * For more complex subscriptions you can do the following
   *
   * window.ipcRenderer.on(MSG_CHANNEL, (event, arg) => {
   *   do something with event and arg here...
   * })
   */
  function subscribeTo(types) {
    return types.forEach(type =>
      window.ipcRenderer.on(type, (ev, { id, data, ...other }) => {
        // ignore messages returned as promises with errors
        if (id && data && data.error) return

        if (id && data && !data.error) {
          store.dispatch({ type, payload: data })
        } else {
          store.dispatch({ type, payload: { ...other } })
        }
      })
    )
  }
}
