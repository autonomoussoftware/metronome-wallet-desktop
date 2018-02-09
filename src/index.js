import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from 'styled-components'
import { Provider } from 'react-redux'
import createStore from './createStore'
import ReactDOM from 'react-dom'
import theme from './theme'
import React from 'react'
import App from './components/App'

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
