import withOnboardingState from 'metronome-wallet-ui-logic/src/hocs/withOnboardingState'
import PropTypes from 'prop-types'
import React from 'react'

import VerifyMnemonicStep from './VerifyMnemonicStep'
import CopyMnemonicStep from './CopyMnemonicStep'
import UserMnemonicStep from './UserMnemonicStep'
import PasswordStep from './PasswordStep'
import TermsStep from './TermsStep'

class Onboarding extends React.Component {
  static propTypes = {
    currentStep: PropTypes.oneOf([
      'recover-from-mnemonic',
      'define-password',
      'verify-mnemonic',
      'ask-for-terms',
      'copy-mnemonic'
    ]).isRequired
  }

  render() {
    switch (this.props.currentStep) {
      case 'ask-for-terms':
        return <TermsStep {...this.props} />
      case 'define-password':
        return <PasswordStep {...this.props} />
      case 'copy-mnemonic':
        return <CopyMnemonicStep {...this.props} />
      case 'verify-mnemonic':
        return <VerifyMnemonicStep {...this.props} />
      case 'recover-from-mnemonic':
        return <UserMnemonicStep {...this.props} />
      default:
        return null
    }
  }
}

export default withOnboardingState(Onboarding)
