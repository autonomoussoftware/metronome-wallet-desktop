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
  Raven.config(
    'https://d99caae5ca1b495584e5aa3187966f30@sentry.io/277183'
  ).install()

  window.addEventListener('unhandledrejection', function(e) {
    Raven.captureException(e.reason)
  })
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
