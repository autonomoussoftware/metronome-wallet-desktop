const { ipcRenderer } = window.require('electron')

export const subscribeToMainProcessMessages = store => {
  /**
   * Subscribe to an array of ipc channels (messages) and dispatch
   * an action of type { type: MSG_CHANNEL, payload: MSG_ARG }
   */
  subscribeTo([
    'wallet-state-changed',
    'rates-updated',
    'create-wallet',
    'open-wallets',
    'error'
  ])

  /**
   * For more complex subscriptions you can do the following
   *
   * ipcRenderer.on(MSG_CHANNEL, (event, arg) => {
   *   do something with event and arg here...
   * })
   */

  function subscribeTo(types) {
    return types.forEach(type =>
      ipcRenderer.on(type, (event, { id, data, ...other }) => {
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
