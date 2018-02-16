import { TextInput, BaseBtn, Btn, Sp } from './common'
import { validateMnemonic } from '../validator'
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

const RecoverBtn = styled(BaseBtn)`
  font-size: 1.2rem;
  :hover {
    opacity: 0.75;
  }
`

export default class Onboarding extends React.Component {
  static propTypes = {
    onOnboardingCompleted: PropTypes.func.isRequired
  }

  state = {
    passwordWasDefined: false,
    termsWereAccepted: false,
    useOwnMnemonic: false,
    passwordAgain: null,
    userMnemonic: null,
    password: null,
    mnemonic: bip39.generateMnemonic(),
    errors: {}
  }

  onTermsAccepted = () => this.setState({ termsWereAccepted: true })

  onInputChanged = e => {
    const { id, value } = e.target
    this.setState(state => ({
      ...state,
      [id]: value,
      errors: { ...state.errors, [id]: null }
    }))
  }

  onUseOwnMnemonicToggled = () => {
    this.setState(state => ({
      ...state,
      useOwnMnemonic: !state.useOwnMnemonic,
      userMnemonic: null,
      errors: {
        ...state.errors,
        userMnemonic: null
      }
    }))
  }

  onPasswordSubmitted = e => {
    e.preventDefault()

    const errors = this.validatePass()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    this.setState({ passwordWasDefined: true })
  }

  // Perform validations and return an object of type { fieldId: [String] }
  validatePass = () => {
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

  onMnemonicAccepted = e => {
    e.preventDefault()

    const { useOwnMnemonic, userMnemonic, mnemonic, password } = this.state

    if (useOwnMnemonic) {
      const errors = validateMnemonic(userMnemonic, 'userMnemonic')
      if (Object.keys(errors).length > 0) return this.setState({ errors })
    }

    this.props.onOnboardingCompleted({
      password,
      mnemonic: useOwnMnemonic ? userMnemonic : mnemonic
    })
  }

  render() {
    const {
      passwordWasDefined,
      termsWereAccepted,
      useOwnMnemonic,
      passwordAgain,
      userMnemonic,
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
            <form onSubmit={this.onMnemonicAccepted}>
              <Message>
                {useOwnMnemonic
                  ? 'Enter a valid 12 word passphrase to recover a previously created wallet.'
                  : 'Copy the following word list and keep it in a safe place. You will need these to recover your wallet in the future—don’t lose it.'}
              </Message>

              <Sp mt={3} mx={-8}>
                {useOwnMnemonic ? (
                  <TextInput
                    autoFocus
                    onChange={this.onInputChanged}
                    label="Recovery passphrase"
                    error={errors.userMnemonic}
                    value={userMnemonic || ''}
                    rows={2}
                    id="userMnemonic"
                  />
                ) : (
                  <Mnemonic>{mnemonic}</Mnemonic>
                )}
              </Sp>

              <Sp mt={5}>
                <Btn block submit>
                  {useOwnMnemonic ? 'Recover' : 'Done'}
                </Btn>
              </Sp>
              <Sp mt={2}>
                <RecoverBtn block onClick={this.onUseOwnMnemonicToggled}>
                  {useOwnMnemonic
                    ? 'Cancel'
                    : 'Or recover a wallet from a saved passphrase'}
                </RecoverBtn>
              </Sp>
            </form>
          )}
      </AltLayout>
    )
  }
}
