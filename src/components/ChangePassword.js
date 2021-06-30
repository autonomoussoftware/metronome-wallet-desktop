import withChangePasswordState from 'metronome-wallet-ui-logic/src/hocs/withChangePasswordState'
import { withRouter } from 'react-router-dom'
import * as utils from 'metronome-wallet-ui-logic/src/utils'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { EntropyMeter, DarkLayout, TextInput, Btn, Sp } from './common'
import { ToastsContext } from '../components/toasts'

const Container = styled.div`
  padding: 3.2rem 2.4rem;
  max-width: 50rem;

  @media (min-width: 800px) {
    padding: 3.2rem 4.8rem;
  }
`

const PasswordMessage = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.5;
  margin-top: 3.2rem;
`

const Green = styled.div`
  display: inline-block;
  color: ${(p) => p.theme.colors.success};
`

const ErrorMessage = styled.div`
  color: ${(p) => p.theme.colors.danger}
  font-size: 1.2rem;
  margin-top: 2.4rem;
  margin-bottom: -3.9rem;
`

class ChangePassword extends React.Component {
  static propTypes = {
    requiredPasswordEntropy: PropTypes.number.isRequired,
    newPasswordAgain: PropTypes.string,
    onInputChange: PropTypes.func.isRequired,
    newPassword: PropTypes.string,
    oldPassword: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    status: PropTypes.oneOf(['init', 'pending', 'success', 'failure']),
    errors: utils.errorPropTypes(
      'newPasswordAgain',
      'newPassword',
      'oldPassword'
    ),
    error: PropTypes.string,
  }

  static contextType = ToastsContext

  handleSubmitAndNavigate = (e) => {
    e.preventDefault()
    this.props.onSubmit()
  }

  componentDidUpdate(prevProps) {
    if (this.props.status === 'success' && prevProps.status !== 'success') {
      this.props.history.push('/tools')
      this.context.toast('success', 'Password successfully changed')
    }
  }

  render() {
    return (
      <DarkLayout
        data-testid="change-password-container"
        title="Change your password"
      >
        <Container>
          <form
            data-testid="change-password-form"
            onSubmit={this.handleSubmitAndNavigate}
          >
            <Sp mt={2}>
              <TextInput
                data-testid="oldPassword-field"
                autoFocus
                onChange={this.props.onInputChange}
                label="Current Password"
                error={this.props.errors.oldPassword}
                value={this.props.oldPassword || ''}
                type="password"
                id="oldPassword"
              />
            </Sp>
            <PasswordMessage>
              Enter a strong password until the meter turns <Green>green</Green>
              .
            </PasswordMessage>
            <Sp mt={2}>
              <TextInput
                data-testid="newPassword-field"
                onChange={this.props.onInputChange}
                label="New Password"
                error={this.props.errors.newPassword}
                value={this.props.newPassword || ''}
                type="password"
                id="newPassword"
              />
              {!this.props.errors.newPassword && (
                <EntropyMeter
                  targetEntropy={this.props.requiredPasswordEntropy}
                  password={this.props.newPassword}
                />
              )}
            </Sp>
            <Sp mt={3}>
              <TextInput
                data-testid="newPassword-again-field"
                onChange={this.props.onInputChange}
                error={this.props.errors.newPasswordAgain}
                label="Repeat New Password"
                value={this.props.newPasswordAgain}
                type="password"
                id="newPasswordAgain"
              />
            </Sp>
            {this.props.error && (
              <ErrorMessage>{this.props.error}</ErrorMessage>
            )}
            <Sp mt={8}>
              <Btn submit disabled={this.props.status === 'pending'}>
                Change Password
              </Btn>
            </Sp>
          </form>
        </Container>
      </DarkLayout>
    )
  }
}

export default withRouter(withChangePasswordState(ChangePassword))
