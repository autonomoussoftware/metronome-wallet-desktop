const { ipcRenderer } = window.require('electron')

export const subscribeToMainProcessMessages = store => {
  /**
   * Subscribe to an array of ipc channels (messages) and dispatch
   * an action of type { type: MSG_CHANNEL, payload: MSG_ARG }
   */
  subscribeTo([
    'new-auction-status',
    'new-transaction',
    'balance-update',
    'receipt'
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
      ipcRenderer.on(type, (event, payload) =>
        store.dispatch({ type, payload })
      )
    )
  }
}
