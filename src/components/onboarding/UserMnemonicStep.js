import PropTypes from 'prop-types'
import React from 'react'

import { TextInput, AltLayout, Btn, Sp } from '../common'
import SecondaryBtn from './SecondaryBtn'
import * as utils from '../../utils'
import Message from './Message'

export default class UserMnemonic extends React.Component {
  static propTypes = {
    onUseUserMnemonicToggled: PropTypes.func.isRequired,
    onMnemonicAccepted: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired,
    userMnemonic: PropTypes.string,
    shouldSubmit: PropTypes.func.isRequired,
    getTooltip: PropTypes.func.isRequired,
    errors: utils.errorPropTypes('userMnemonic')
  }

  render() {
    return (
      <AltLayout title="Recovery Passphrase" data-testid="onboarding-container">
        <form
          data-testid="mnemonic-form"
          onSubmit={this.props.onMnemonicAccepted}
        >
          <Message>
            Enter a valid 12 word passphrase to recover a previously created
            wallet.
          </Message>
          <Sp mt={3} mx={-8}>
            <TextInput
              data-testid="mnemonic-field"
              autoFocus
              onChange={this.props.onInputChange}
              label="Recovery passphrase"
              error={this.props.errors.userMnemonic}
              value={this.props.userMnemonic || ''}
              rows={3}
              id="userMnemonic"
            />
          </Sp>
          <Sp mt={5}>
            <Btn
              data-rh-negative
              data-disabled={!this.props.shouldSubmit(this.props.userMnemonic)}
              data-rh={this.props.getTooltip(this.props.userMnemonic)}
              submit={this.props.shouldSubmit(this.props.userMnemonic)}
              block
            >
              Recover
            </Btn>
          </Sp>
          <Sp mt={2}>
            <SecondaryBtn
              data-testid="cancel-btn"
              onClick={this.props.onUseUserMnemonicToggled}
              block
            >
              Cancel
            </SecondaryBtn>
          </Sp>
        </form>
      </AltLayout>
    )
  }
}
