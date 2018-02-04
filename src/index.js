import { ThemeProvider } from 'styled-components'
import { Provider } from 'react-redux'
import createStore from './ui/createStore'
import ReactDOM from 'react-dom'
import theme from './ui/theme'
import React from 'react'
import App from './ui/App'

// We could pass some initial state to createStore()
const store = createStore()

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById('root')
)
