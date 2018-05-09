import { subscribeToMainProcessMessages } from './subscriptions'
import { sendToMainProcess } from './utils'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from 'styled-components'
import { Tooltips } from './components/common'
import { Provider } from 'react-redux'
import createStore from './createStore'
import ReactDOM from 'react-dom'
import config from './config'
import Modal from 'react-modal'
import Raven from 'raven-js'
import theme from './theme'
import React from 'react'
import App from './components/App'

if (config.SENTRY_DSN) {
  Raven.config(config.SENTRY_DSN).install()
  window.addEventListener('unhandledrejection', e =>
    Raven.captureException(e.reason)
  )
}

// We could pass some initial state to createStore()
const store = createStore()

// Initialize all the Main Process subscriptions
subscribeToMainProcessMessages(store)

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <React.Fragment>
        <App onMount={() => sendToMainProcess('ui-ready')} />
        <Tooltips />
        <ToastContainer position="top-center" hideProgressBar />
      </React.Fragment>
    </ThemeProvider>
  </Provider>,
  document.getElementById('root')
)

Modal.setAppElement('#root')
