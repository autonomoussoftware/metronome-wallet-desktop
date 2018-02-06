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
    hasEnoughData: PropTypes.bool.isRequired
  }

  state = {
    onboardingComplete: null,
    sessionIsActive: false
  }

  componentDidMount() {
    sendToMainProcess('ui-ready').then(({ onboardingComplete }) => {
      this.setState({ onboardingComplete })
    })
  }

  onOnboardingCompleted = ({ password, mnemonic }) => {
    sendToMainProcess('create-wallet', { password, mnemonic }).then(() => {
      this.setState({ onboardingComplete: true, sessionIsActive: true })
    })
  }

  onPasswordAccepted = () => this.setState({ sessionIsActive: true })

  render() {
    const { onboardingComplete, sessionIsActive } = this.state
    const { hasEnoughData } = this.props

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
  hasEnoughData: selectors.hasEnoughData(state)
})

export default connect(mapStateToProps)(App)
