import React, { Component } from 'react'
import * as selectors from './selectors'
import { connect } from 'react-redux'
import Onboarding from './components/Onboarding'
import PropTypes from 'prop-types'
import Splash from './components/Splash'
import Router from './Router'

class App extends Component {
  static propTypes = {
    isInitialized: PropTypes.bool.isRequired,
    isReady: PropTypes.bool.isRequired
  }

  render() {
    const { isInitialized, isReady } = this.props

    return !isReady ? <Splash /> : isInitialized ? <Router /> : <Onboarding />
  }
}

const mapStateToProps = state => ({
  isInitialized: selectors.isInitialized(state),
  isReady: selectors.isReady(state)
})

export default connect(mapStateToProps)(App)
