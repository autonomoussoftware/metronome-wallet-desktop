import { sendToMainProcess } from './utils'
import React, { Component } from 'react'
import PasswordRequest from './components/PasswordRequest'
import * as selectors from './selectors'
import LoadingScene from './components/LoadingScene'
import { connect } from 'react-redux'
import Onboarding from './components/Onboarding'
import PropTypes from 'prop-types'
import Router from './Router'

class App extends Component {
  static propTypes = {
    sessionIsActive: PropTypes.bool.isRequired,
    hasEnoughData: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  state = {
    onboardingComplete: null
  }

  componentDidMount() {
    sendToMainProcess('ui-ready')
      .then(({ onboardingComplete }) => {
        this.setState({ onboardingComplete })
      })
      .catch(console.warn)

    window.addEventListener('beforeunload', function(event) {
      sendToMainProcess('ui-unload')
    })
  }

  onOnboardingCompleted = ({ password, mnemonic }) => {
    sendToMainProcess('create-wallet', { password, mnemonic }).then(() => {
      this.setState({ onboardingComplete: true })
      this.props.dispatch({ type: 'session-started', payload: { password } })
    })
  }

  onPasswordAccepted = ({ password }) =>
    this.props.dispatch({ type: 'session-started', payload: { password } })

  render() {
    const { sessionIsActive, hasEnoughData } = this.props
    const { onboardingComplete } = this.state

    if (onboardingComplete === null) return null

    return !onboardingComplete ? (
      <Onboarding onOnboardingCompleted={this.onOnboardingCompleted} />
    ) : !sessionIsActive ? (
      <PasswordRequest onPasswordAccepted={this.onPasswordAccepted} />
    ) : !hasEnoughData ? (
      <LoadingScene />
    ) : (
      <Router />
    )
  }
}

const mapStateToProps = state => ({
  sessionIsActive: selectors.sessionIsActive(state),
  hasEnoughData: selectors.hasEnoughData(state)
})

export default connect(mapStateToProps)(App)
