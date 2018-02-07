import { TextInput, Btn, Sp } from '../common'
import { sendToMainProcess } from '../utils'
import AltLayout from './AltLayout'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const ErrorMsg = styled.div`
  color: ${p => p.theme.colors.danger};
  margin-top: 1.6rem;
`

export default class PasswordRequest extends React.Component {
  static propTypes = {
    onPasswordAccepted: PropTypes.func.isRequired
  }

  state = {
    password: null,
    errors: {},
    status: 'init',
    error: null
  }

  onInputChanged = e =>
    this.setState({ [e.target.id]: e.target.value, errors: {} })

  onPasswordSubmitted = e => {
    e.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    this.setState({ status: 'pending', error: null }, () =>
      sendToMainProcess('open-wallets', { password: this.state.password })
        .then(() =>
          this.props.onPasswordAccepted({ password: this.state.password })
        )
        .catch(e =>
          this.setState({
            status: 'failure',
            error: e.message || 'Unknown error'
          })
        )
    )
  }

  // Perform validations and return an object of type { fieldId: [String] }
  validate = () => {
    const { password } = this.state
    const errors = {}

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }

    return errors
  }

  render() {
    const { password, errors, status, error } = this.state

    return (
      <AltLayout title="Enter your password">
        <form onSubmit={this.onPasswordSubmitted}>
          <Sp mt={4}>
            <TextInput
              autoFocus
              onChange={this.onInputChanged}
              error={errors.password}
              label="Password"
              value={password}
              type="password"
              id="password"
            />
          </Sp>
          <Sp mt={6}>
            <Btn block submit disabled={status === 'pending'}>
              Send
            </Btn>
          </Sp>
          {error && <ErrorMsg>{error}</ErrorMsg>}
        </form>
      </AltLayout>
    )
  }
}
