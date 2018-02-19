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
    mnemonicWasCopied: false,
    useOwnMnemonic: false,
    passwordAgain: null,
    mnemonicAgain: null,
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

  onMnemonicWasCopiedToggled = () => {
    this.setState(state => ({
      ...state,
      mnemonicWasCopied: !state.mnemonicWasCopied,
      mnemonicAgain: null,
      errors: {
        ...state.errors,
        mnemonicAgain: null
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

  onMnemonicAccepted = ev => {
    ev.preventDefault()

    const {
      useOwnMnemonic,
      mnemonicAgain,
      userMnemonic,
      mnemonic,
      password
    } = this.state

    if (useOwnMnemonic) {
      const errors = validateMnemonic(userMnemonic, 'userMnemonic')
      if (Object.keys(errors).length > 0) return this.setState({ errors })
    } else {
      if (mnemonic !== mnemonicAgain) {
        return this.setState({
          errors: {
            mnemonicAgain:
              'The text provided does not match your recovery passphrase.'
          }
        })
      }
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
      mnemonicWasCopied,
      useOwnMnemonic,
      passwordAgain,
      mnemonicAgain,
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
              {useOwnMnemonic ? (
                <Message>
                  Enter a valid 12 word passphrase to recover a previously
                  created wallet.
                </Message>
              ) : mnemonicWasCopied ? (
                <Message>
                  To verify you have copied the recovery passphrase correctly,
                  enter the 12 words provided before in the field below.
                </Message>
              ) : (
                <Message>
                  Copy the following word list and keep it in a safe place. You
                  will need these to recover your wallet in the future—don’t
                  lose it.
                </Message>
              )}
              <Sp mt={3} mx={-8}>
                {useOwnMnemonic || mnemonicWasCopied ? (
                  <TextInput
                    autoFocus
                    onChange={this.onInputChanged}
                    label="Recovery passphrase"
                    error={
                      useOwnMnemonic
                        ? errors.userMnemonic
                        : errors.mnemonicAgain
                    }
                    value={
                      (useOwnMnemonic ? userMnemonic : mnemonicAgain) || ''
                    }
                    rows={2}
                    id={useOwnMnemonic ? 'userMnemonic' : 'mnemonicAgain'}
                  />
                ) : (
                  <Mnemonic>{mnemonic}</Mnemonic>
                )}
              </Sp>

              <Sp mt={5}>
                {useOwnMnemonic ? (
                  <Btn block submit>
                    Recover
                  </Btn>
                ) : mnemonicWasCopied ? (
                  <Btn block submit key="a">
                    Done
                  </Btn>
                ) : (
                  <Btn block onClick={this.onMnemonicWasCopiedToggled} key="b">
                    {"I've copied it"}
                  </Btn>
                )}
              </Sp>
              <Sp mt={2}>
                {useOwnMnemonic ? (
                  <RecoverBtn block onClick={this.onUseOwnMnemonicToggled}>
                    Cancel
                  </RecoverBtn>
                ) : mnemonicWasCopied ? (
                  <RecoverBtn block onClick={this.onMnemonicWasCopiedToggled}>
                    Go back
                  </RecoverBtn>
                ) : (
                  <RecoverBtn block onClick={this.onUseOwnMnemonicToggled}>
                    Or recover a wallet from a saved passphrase
                  </RecoverBtn>
                )}
              </Sp>
            </form>
          )}
      </AltLayout>
    )
  }
}
