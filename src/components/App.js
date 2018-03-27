import { sendToMainProcess } from '../utils'
import React, { Component } from 'react'
import PasswordRequest from './PasswordRequest'
import * as selectors from '../selectors'
import LoadingScene from './LoadingScene'
import { connect } from 'react-redux'
import Onboarding from './Onboarding'
import PropTypes from 'prop-types'
import Router from './Router'

class App extends Component {
  static propTypes = {
    isSessionActive: PropTypes.bool.isRequired,
    hasEnoughData: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    onMount: PropTypes.func.isRequired
  }

  state = {
    onboardingComplete: null
  }

  componentDidMount() {
    this.props
      .onMount()
      .then(({ onboardingComplete }) => {
        this.setState({ onboardingComplete })
      })
      .catch(console.warn)

    window.addEventListener('beforeunload', function() {
      sendToMainProcess('ui-unload')
    })

    window.addEventListener('online', () => {
      this.props.dispatch({
        type: 'connectivity-state-changed',
        payload: { ok: true }
      })
    })

    window.addEventListener('offline', () => {
      this.props.dispatch({
        type: 'connectivity-state-changed',
        payload: { ok: false }
      })
    })
  }

  onOnboardingCompleted = ({ password, mnemonic }) => {
    return sendToMainProcess('create-wallet', { password, mnemonic })
      .then(() => {
        this.setState({ onboardingComplete: true })
        this.props.dispatch({ type: 'session-started' })
      })
      .catch(console.warn)
  }

  onLoginSubmit = ({ password }) => {
    return sendToMainProcess('open-wallets', { password }).then(() =>
      this.props.dispatch({ type: 'session-started' })
    )
  }

  render() {
    const { isSessionActive, hasEnoughData } = this.props
    const { onboardingComplete } = this.state

    if (onboardingComplete === null) return null

    return !onboardingComplete ? (
      <Onboarding onOnboardingCompleted={this.onOnboardingCompleted} />
    ) : !isSessionActive ? (
      <PasswordRequest onLoginSubmit={this.onLoginSubmit} />
    ) : !hasEnoughData ? (
      <LoadingScene />
    ) : (
      <Router />
    )
  }
}

const mapStateToProps = state => ({
  isSessionActive: selectors.isSessionActive(state),
  hasEnoughData: selectors.hasEnoughData(state)
})

export default connect(mapStateToProps)(App)
