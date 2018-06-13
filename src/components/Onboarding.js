import { TextInput, BaseBtn, Btn, Sp } from './common'
import { sanitizeMnemonic } from '../utils'
import * as validators from '../validator'
import EntropyMeter from './EntropyMeter'
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

  & span {
    font-size: 13px;
  }

  & a {
    text-decoration: underline;
    font-size: 13px;
    cursor: pointer;
    color: ${p => p.theme.colors.success};
  }
`

const Green = styled.div`
  display: inline-block;
  color: ${p => p.theme.colors.success};
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

const ErrorMsg = styled.div`
  color: ${p => p.theme.colors.danger};
  margin-top: 1.6rem;
  text-align: center;
`

const DisclaimerWarning = styled.div`
  text-align: center;
  font-size: 16px;
  margin-top: 16px;
`

const DisclaimerMessge = styled.div`
  width: 288px;
  height: 130px;
  border-radius: 2px;
  background-color: rgba(0, 0, 0, 0.1);
  overflow: auto;
  font-size: 12px;
  padding: 10px 16px 0 16px;
  margin: 16px 0;
`

export default class Onboarding extends React.Component {
  static propTypes = {
    onOnboardingCompleted: PropTypes.func.isRequired
  }

  state = {
    passwordWasDefined: false,
    termsWereAccepted: false,
    licenseIsChecked: false,
    termsIsChecked: false,
    mnemonicWasCopied: false,
    useOwnMnemonic: false,
    passwordAgain: null,
    mnemonicAgain: null,
    userMnemonic: null,
    password: null,
    mnemonic: bip39.generateMnemonic(),
    errors: {},
    error: null
  }

  onTermsAccepted = () => this.setState({ termsWereAccepted: true })

  onTermsChange = e => this.setState({ termsIsChecked: !this.state.termsIsChecked })
  onLinceseChange = e => this.setState({ licenseIsChecked: !this.state.licenseIsChecked })

  onInputChanged = e => {
    const { id, value } = e.target
    this.setState(state => ({
      ...state,
      [id]: value,
      errors: { ...state.errors, [id]: null },
      error: null
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
    const errors = validators.validatePasswordCreation(password)

    if (!errors.password && !passwordAgain) {
      errors.passwordAgain = 'Repeat the password'
    } else if (!errors.password && passwordAgain !== password) {
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
      const errors = validators.validateMnemonic(
        sanitizeMnemonic(userMnemonic),
        'userMnemonic'
      )
      if (Object.keys(errors).length > 0) return this.setState({ errors })
    } else {
      if (mnemonic !== sanitizeMnemonic(mnemonicAgain)) {
        return this.setState({
          errors: {
            mnemonicAgain:
              'The text provided does not match your recovery passphrase.'
          }
        })
      }
    }

    this.props
      .onOnboardingCompleted({
        password,
        mnemonic: useOwnMnemonic ? sanitizeMnemonic(userMnemonic) : mnemonic
      })
      .catch(({ message }) =>
        this.setState({ status: 'failure', error: message || 'Unknown error' })
      )
  }

  // eslint-disable-next-line complexity
  render() {
    const {
      passwordWasDefined,
      termsWereAccepted,
      termsIsChecked,
      licenseIsChecked,
      mnemonicWasCopied,
      useOwnMnemonic,
      passwordAgain,
      mnemonicAgain,
      userMnemonic,
      password,
      mnemonic,
      errors,
      error
    } = this.state

    const title = !termsWereAccepted
      ? 'Accept to Continue'
      : !passwordWasDefined ? 'Define a Password' : 'Recovery Passphrase'

    const getWordsAmount = phrase =>
      sanitizeMnemonic(phrase || '').split(' ').length

    const shouldSubmit = phrase => getWordsAmount(phrase) === 12

    const getTooltip = phrase =>
      shouldSubmit(phrase)
        ? null
        : 'A recovery phrase must have exactly 12 words'

    return (
      <AltLayout title={title} data-testid="onboarding-container">
        {!termsWereAccepted && (
          <React.Fragment>
            <DisclaimerWarning>Please read and accept these terms and permissions.</DisclaimerWarning>
            <DisclaimerMessge>
              <p>Copyright 2018 Autonomous Software</p>

              <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>

              <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>

              <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>

              <p>ADDITIONAL TERMS REGARDING SOFTWARE USE</p>

              <p>The Software represents cryptocurrency wallet software (the "Wallet").  IF YOU LOSE ACCESS TO YOUR WALLET OR YOUR ENCRYPTED PRIVATE KEYS AND YOU HAVE NOT SEPARATELY STORED A BACKUP OF YOUR WALLET AND CORRESPONDING PASSWORD, ANY AMOUNTS YOU HAVE STORED WITHIN WALLET WILL BECOME INACCESSIBLE.  Autonomous Software cannot retrieve your private keys or passwords if you lose or forget them.  Autonomous Software does not control any of the protocols that govern any cryptocurrency and cannot confirm any transaction</p>

              <p>Transactions with cryptocurrencies carry inherent risks.   Cryptocurrency values may involve risk of capital loss from unfavorable fluctuation in cryptocurrency values, technical defects inherent in cryptocurrencies, exchange-related risks, policy risks, regulatory risks, liquidity, and market price fluctuation and demand. The value of any cryptocurrency is not ensured. The worth of any amount of cryptocurrency and may lose all worth at any moment of time due to the risky nature of cryptocurrencies. Virtual currency is not legal tender, is not backed by the government, and accounts and value balances are not subject to FDIC or SIPC protections, among others.  You are solely responsible for any such losses and the management of the cryptocurrencies in your Wallet. There may be an increased risk of loss of cryptocurrency due to cyber-attacks. Autonomous Software shall not be liable for any losses to your Wallet you may suffer as a result of a security breach, fraudulent activity or hacking event.</p>
            </DisclaimerMessge>
            <Message>
              <div>
                <input type="checkbox" onChange={this.onTermsChange}/>
                <span>I have read and accept these terms</span>
              </div>
              <div>
                <input type="checkbox"onChange={this.onLinceseChange}/>
                <span>I have read and accept the </span>
                <a onClick={() => shell.openExternal('http://metronome.io')}>
                  software license
                </a>.
              </div>
            </Message>

            <Sp mt={6}>
              <Btn
                data-testid="accept-terms-btn"
                autoFocus
                onClick={this.onTermsAccepted}
                disabled={!termsIsChecked || !licenseIsChecked}
                block
              >
                Accept
              </Btn>
            </Sp>
          </React.Fragment>
        )}
        {termsWereAccepted &&
          !passwordWasDefined && (
            <form onSubmit={this.onPasswordSubmitted} data-testid="pass-form">
              <Message>
                Enter a strong password until the meter turns{' '}
                <Green>green</Green>.
              </Message>
              <Sp mt={2}>
                <TextInput
                  data-testid="pass-field"
                  autoFocus
                  onChange={this.onInputChanged}
                  error={errors.password}
                  label="Password"
                  value={password}
                  type="password"
                  id="password"
                  noFocus
                />
                {!errors.password && (
                  <EntropyMeter targetEntropy={72} password={password} />
                )}
              </Sp>
              <Sp mt={3}>
                <TextInput
                  data-testid="pass-again-field"
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
            <form
              data-testid="mnemonic-form"
              onSubmit={this.onMnemonicAccepted}
            >
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
                  will need these to recover your wallet in the future —don’t
                  lose it.
                </Message>
              )}
              <Sp mt={3} mx={-8}>
                {useOwnMnemonic || mnemonicWasCopied ? (
                  <TextInput
                    data-testid="mnemonic-field"
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
                    rows={3}
                    id={useOwnMnemonic ? 'userMnemonic' : 'mnemonicAgain'}
                  />
                ) : (
                  <Mnemonic data-testid="mnemonic-label">{mnemonic}</Mnemonic>
                )}
                {error && <ErrorMsg data-testid="error-msg">{error}</ErrorMsg>}
              </Sp>

              <Sp mt={5}>
                {useOwnMnemonic ? (
                  <Btn
                    data-rh-negative
                    data-disabled={!shouldSubmit(userMnemonic)}
                    data-rh={getTooltip(userMnemonic)}
                    submit={shouldSubmit(userMnemonic)}
                    block
                  >
                    Recover
                  </Btn>
                ) : mnemonicWasCopied ? (
                  <Btn
                    data-rh-negative
                    data-disabled={!shouldSubmit(mnemonicAgain)}
                    data-rh={getTooltip(mnemonicAgain)}
                    submit={shouldSubmit(mnemonicAgain)}
                    block
                    key="sendMnemonic"
                  >
                    Done
                  </Btn>
                ) : (
                  <Btn
                    data-testid="copied-mnemonic-btn"
                    autoFocus
                    onClick={this.onMnemonicWasCopiedToggled}
                    block
                    key="confirmMnemonic"
                  >
                    {"I've copied it"}
                  </Btn>
                )}
              </Sp>
              <Sp mt={2}>
                {useOwnMnemonic ? (
                  <RecoverBtn
                    data-testid="cancel-btn"
                    onClick={this.onUseOwnMnemonicToggled}
                    block
                  >
                    Cancel
                  </RecoverBtn>
                ) : mnemonicWasCopied ? (
                  <RecoverBtn
                    data-testid="goback-btn"
                    onClick={this.onMnemonicWasCopiedToggled}
                    block
                  >
                    Go back
                  </RecoverBtn>
                ) : (
                  <RecoverBtn
                    data-testid="recover-btn"
                    onClick={this.onUseOwnMnemonicToggled}
                    block
                  >
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
