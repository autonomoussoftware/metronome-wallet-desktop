import { TextInput, Btn, Sp } from '../common'
import AltLayout from './AltLayout'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import bip39 from 'bip39'

const { shell } = window.require('electron')

const Message = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;

  & span {
    text-decoration: underline;
    cursor: pointer;
    color: ${p => p.theme.colors.success};
  }
`

const Mnemonic = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 2;
  text-align: center;
  color: ${p => p.theme.colors.primary};
  word-spacing: 1.6rem;
`

export default class Onboarding extends React.Component {
  static propTypes = {
    onOnboardingCompleted: PropTypes.func.isRequired
  }

  state = {
    passwordWasDefined: false,
    termsWereAccepted: false,
    passwordAgain: null,
    password: null,
    mnemonic: bip39.generateMnemonic(),
    errors: {}
  }

  onTermsAccepted = () => this.setState({ termsWereAccepted: true })

  onInputChanged = e => this.setState({ [e.target.id]: e.target.value })

  onPasswordSubmitted = e => {
    e.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    this.setState({ passwordWasDefined: true })
  }

  // Perform validations and return an object of type { fieldId: [String] }
  validate = () => {
    const { password, passwordAgain } = this.state
    const errors = {}

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    } else if (!passwordAgain) {
      errors.passwordAgain = 'Repeat the password'
    } else if (passwordAgain !== password) {
      errors.passwordAgain = "Passwords don't match"
    }

    return errors
  }

  onMnemonicAccepted = () => {
    this.props.onOnboardingCompleted({
      password: this.state.password,
      mnemonic: this.state.mnemonic
    })
  }

  render() {
    const {
      passwordWasDefined,
      termsWereAccepted,
      passwordAgain,
      password,
      mnemonic,
      errors
    } = this.state

    const title = !termsWereAccepted
      ? 'Accept to Continue'
      : !passwordWasDefined ? 'Define a Password' : 'Recovery Passphrase'

    return (
      <AltLayout title={title}>
        {!termsWereAccepted && (
          <React.Fragment>
            <Message>
              By clicking “Accept”, you confirm you have read and agreed to our{' '}
              <span onClick={() => shell.openExternal('http://metronome.io')}>
                software license
              </span>.
            </Message>

            <Sp mt={6}>
              <Btn block onClick={this.onTermsAccepted}>
                Accept
              </Btn>
            </Sp>
          </React.Fragment>
        )}
        {termsWereAccepted &&
          !passwordWasDefined && (
            <form onSubmit={this.onPasswordSubmitted}>
              <Message>It must be at least 8 characters long.</Message>
              <Sp mt={2}>
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
              <Sp mt={3}>
                <TextInput
                  onChange={this.onInputChanged}
                  error={errors.passwordAgain}
                  label="Repeat password"
                  value={passwordAgain}
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
          )}
        {termsWereAccepted &&
          passwordWasDefined && (
            <React.Fragment>
              <Message>
                Copy the following word list and keep it in a safe place. You
                will need these to recover your wallet in the future—don’t lose
                it.
              </Message>

              <Sp mt={3} mx={-8}>
                <Mnemonic>{mnemonic}</Mnemonic>
              </Sp>
              <Sp mt={6}>
                <Btn block onClick={this.onMnemonicAccepted}>
                  Done
                </Btn>
              </Sp>
            </React.Fragment>
          )}
      </AltLayout>
    )
  }
}
