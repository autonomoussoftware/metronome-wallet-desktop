import { toast } from 'react-toastify'
const { ipcRenderer } = window.require('electron')

export const subscribeToMainProcessMessages = store => {
  /**
   * Subscribe to an array of IPC messages and dispatch a Redux
   * action of type { type: MSG_CHANNEL, payload: MSG_ARG }
   */
  subscribeTo([
    'mtn-converter-status-updated',
    'auction-status-updated',
    'wallet-state-changed',
    'eth-price-updated',
    'create-wallet',
    'open-wallets',
    'eth-block'
  ])

  ipcRenderer.on('error', (ev, { error }) => toast.error(error.message))

  /**
   * For more complex subscriptions you can do the following
   *
   * ipcRenderer.on(MSG_CHANNEL, (event, arg) => {
   *   do something with event and arg here...
   * })
   */
  function subscribeTo(types) {
    return types.forEach(type =>
      ipcRenderer.on(type, (ev, { id, data, ...other }) => {
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
