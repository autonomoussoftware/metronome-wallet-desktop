import React from 'react'
import Raven from 'raven-js'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from 'styled-components'

import theme from './theme'
import config from './config'
import App from './components/App'
import createStore from './createStore'

if (config.SENTRY_DSN) {
  Raven.config(config.SENTRY_DSN).install()

  window.addEventListener('unhandledrejection', e =>
    Raven.captureException(e.reason)
  )
}

// We could pass some initial state to createStore()
const store = createStore()

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <React.Fragment>
        <App />
        <ToastContainer position="top-center" hideProgressBar />
      </React.Fragment>
    </ThemeProvider>
  </Provider>,
  document.getElementById('root')
)
