import { subscribeToMainProcessMessages } from './ui/subscriptions'
import { ThemeProvider } from 'styled-components'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import reducer from './ui/reducers'
import theme from './ui/theme'
import React from 'react'
import App from './ui/App'

const store = createStore(
  reducer,
  /* { we could pre load some initial state here... }, */
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

// Initialize all main process subscriptions and send 'ready' message
subscribeToMainProcessMessages(store)

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById('root')
)
