import PropTypes from 'prop-types'
import React from 'react'

import { TextInput, AltLayout, Btn, Sp } from '../common'
import SecondaryBtn from './SecondaryBtn'
import * as utils from '../../utils'
import Message from './Message'

export default class VerifyMnemonicStep extends React.Component {
  static propTypes = {
    onUseUserMnemonicToggled: PropTypes.func.isRequired,
    onMnemonicCopiedToggled: PropTypes.func.isRequired,
    requiredPasswordEntropy: PropTypes.number.isRequired,
    onMnemonicAccepted: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired,
    mnemonicAgain: PropTypes.string,
    userMnemonic: PropTypes.string,
    shouldSubmit: PropTypes.func.isRequired,
    getTooltip: PropTypes.func.isRequired,
    mnemonic: PropTypes.string,
    password: PropTypes.string,
    errors: utils.errorPropTypes('mnemonicAgain')
  }

  render() {
    return (
      <AltLayout title="Recovery Passphrase" data-testid="onboarding-container">
        <form
          data-testid="mnemonic-form"
          onSubmit={this.props.onMnemonicAccepted}
        >
          <Message>
            To verify you have copied the recovery passphrase correctly, enter
            the 12 words provided before in the field below.
          </Message>
          <Sp mt={3} mx={-8}>
            <TextInput
              data-testid="mnemonic-field"
              autoFocus
              onChange={this.props.onInputChange}
              label="Recovery passphrase"
              error={this.props.errors.mnemonicAgain}
              value={this.props.mnemonicAgain || ''}
              rows={3}
              id="mnemonicAgain"
            />
          </Sp>
          <Sp mt={5}>
            <Btn
              data-rh-negative
              data-disabled={!this.props.shouldSubmit(this.props.mnemonicAgain)}
              data-rh={this.props.getTooltip(this.props.mnemonicAgain)}
              submit={this.props.shouldSubmit(this.props.mnemonicAgain)}
              block
              key="sendMnemonic"
            >
              Done
            </Btn>
          </Sp>
          <Sp mt={2}>
            <SecondaryBtn
              data-testid="goback-btn"
              onClick={this.props.onMnemonicCopiedToggled}
              block
            >
              Go back
            </SecondaryBtn>
          </Sp>
        </form>
      </AltLayout>
    )
  }
}
