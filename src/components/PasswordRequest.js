import { TextInput, Btn, Sp } from './common'
import { validatePassword } from '../validator'
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
    onLoginSubmit: PropTypes.func.isRequired
  }

  state = {
    password: null,
    status: 'init',
    errors: {},
    error: null
  }

  onInputChanged = e => {
    this.setState({ [e.target.id]: e.target.value, errors: {}, error: null })
  }

  onPasswordSubmitted = e => {
    e.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    this.setState({ status: 'pending', error: null })
    this.props.onLoginSubmit({ password: this.state.password }).catch(err =>
      this.setState({
        status: 'failure',
        error: err.message || 'Unknown error'
      })
    )
  }

  validate = () => {
    const { password } = this.state
    return { ...validatePassword(password) }
  }

  render() {
    const { password, errors, status, error } = this.state

    return (
      <AltLayout title="Enter your password">
        <form onSubmit={this.onPasswordSubmitted} data-testid="login-form">
          <Sp mt={4}>
            <TextInput
              data-testid="pass-field"
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
          {error && <ErrorMsg data-testid="error-msg">{error}</ErrorMsg>}
        </form>
      </AltLayout>
    )
  }
}
