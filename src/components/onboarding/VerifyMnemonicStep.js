import * as utils from 'metronome-wallet-ui-logic/src/utils'
import PropTypes from 'prop-types'
import React from 'react'

import { TextInput, AltLayout, Btn, Sp } from '../common'
import SecondaryBtn from './SecondaryBtn'
import Message from './Message'

export default class VerifyMnemonicStep extends React.Component {
  static propTypes = {
    onMnemonicCopiedToggled: PropTypes.func.isRequired,
    onMnemonicAccepted: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired,
    mnemonicAgain: PropTypes.string,
    shouldSubmit: PropTypes.func.isRequired,
    getTooltip: PropTypes.func.isRequired,
    errors: utils.errorPropTypes('mnemonicAgain'),
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
