import { createStore, applyMiddleware, compose } from 'redux'
import { subscribeToMainProcessMessages } from './subscriptions'
import reducer from './reducers'

const { ipcRenderer } = window.require('electron')

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        actionsBlacklist: ['price-updated$'],
        features: { dispatch: true }
      })
    : compose

/**
 * Custom Redux middleware for forwarding actions to Main Process via IPC
 * All actions with a truthy meta.ipc field will be forwarded.
 * Example:
 *
 * Dispatching this Redux action:
 *   { type: "some-action", payload: "foo", meta: { ipc: true} }
 *
 * Would trigger an IPC message called "some-action" with an argument "foo"
 */
const ipcMiddleware = store => next => action => {
  if (action.meta && action.meta.ipc) {
    ipcRenderer.send(action.type, action.payload)
  }
  return next(action)
}

export default function(initialState) {
  const store = createStore(
    reducer,
    initialState,
    composeEnhancers(applyMiddleware(ipcMiddleware))
  )

  // Initialize all the Main Process subscriptions
  subscribeToMainProcessMessages(store)

  return store
}
