import * as utils from 'metronome-wallet-ui-logic/src/utils'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { TextInput, AltLayout, Btn, Sp } from '../common'
import EntropyMeter from './EntropyMeter'
import Message from './Message'

const PasswordMessage = styled(Message)`
  text-align: center;
`

const Green = styled.div`
  display: inline-block;
  color: ${p => p.theme.colors.success};
`

export default class PasswordStep extends React.Component {
  static propTypes = {
    requiredPasswordEntropy: PropTypes.number.isRequired,
    onPasswordSubmit: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired,
    passwordAgain: PropTypes.string,
    password: PropTypes.string,
    errors: utils.errorPropTypes('passwordAgain', 'password')
  }

  onPasswordSubmit = e => {
    e.preventDefault()
    this.props.onPasswordSubmit({ clearOnError: false })
  }

  render() {
    return (
      <AltLayout title="Define a Password" data-testid="onboarding-container">
        <form onSubmit={this.onPasswordSubmit} data-testid="pass-form">
          <PasswordMessage>
            Enter a strong password until the meter turns <Green>green</Green>.
          </PasswordMessage>
          <Sp mt={2}>
            <TextInput
              data-testid="pass-field"
              autoFocus
              onChange={this.props.onInputChange}
              noFocus
              error={this.props.errors.password}
              label="Password"
              value={this.props.password}
              type="password"
              id="password"
            />
            {!this.props.errors.password && (
              <EntropyMeter
                targetEntropy={this.props.requiredPasswordEntropy}
                password={this.props.password}
              />
            )}
          </Sp>
          <Sp mt={3}>
            <TextInput
              data-testid="pass-again-field"
              onChange={this.props.onInputChange}
              error={this.props.errors.passwordAgain}
              label="Repeat password"
              value={this.props.passwordAgain}
              type="password"
              id="passwordAgain"
            />
          </Sp>
          <Sp mt={6}>
            <Btn block submit>
              Continue
            </Btn>
          </Sp>
        </form>
      </AltLayout>
    )
  }
}
