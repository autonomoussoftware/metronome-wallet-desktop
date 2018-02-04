import { LoadingBar, TextInput, Flex, Btn, Sp } from '../common'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import actions from '../actions'
import styled from 'styled-components'
import Banner from './Banner'
import React from 'react'
import bip39 from 'bip39'

const Container = styled(Flex.Column)`
  min-height: 100vh;
  padding: 3.2rem;
  background: ${p => p.theme.colors.bg.dark} url('./images/pattern.png')
    repeat-x top center;
`

const Body = styled.div`
  max-width: 30rem;
  width: 100%;
`

const Title = styled.div`
  line-height: 3rem;
  font-size: 2.4rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const Message = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;

  & a {
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

class Onboarding extends React.Component {
  static propTypes = {
    onboardingCompleted: PropTypes.func.isRequired
  }

  state = {
    mnemonicWasAccepted: false,
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
    const { password, mnemonic } = this.state
    this.setState({ mnemonicWasAccepted: true }, () =>
      this.props.onboardingCompleted({ password, mnemonic })
    )
  }

  render() {
    const {
      mnemonicWasAccepted,
      passwordWasDefined,
      termsWereAccepted,
      passwordAgain,
      password,
      mnemonic,
      errors
    } = this.state

    return (
      <Container align="center">
        <Sp mb={10}>
          <Banner />
        </Sp>
        {!termsWereAccepted && (
          <Body>
            <Title>Accept to Continue</Title>
            <Sp mt={2}>
              <Message>
                By clicking “Accept”, you confirm you have read and agreed to
                our{' '}
                <a href="#" target="_blank">
                  software license
                </a>.
              </Message>
            </Sp>
            <Sp mt={6}>
              <Btn block onClick={this.onTermsAccepted}>
                Accept
              </Btn>
            </Sp>
          </Body>
        )}
        {termsWereAccepted &&
          !passwordWasDefined && (
            <Body>
              <form onSubmit={this.onPasswordSubmitted}>
                <Title>Define a Password</Title>
                <Sp my={2}>
                  <Message>It must be at least 8 characters long.</Message>
                </Sp>
                <TextInput
                  onChange={this.onInputChanged}
                  error={errors.password}
                  label="Password"
                  value={password}
                  id="password"
                />
                <Sp mt={3}>
                  <TextInput
                    onChange={this.onInputChanged}
                    error={errors.passwordAgain}
                    label="Repeat password"
                    value={passwordAgain}
                    id="passwordAgain"
                  />
                </Sp>
                <Sp mt={6}>
                  <Btn block submit>
                    Save Password
                  </Btn>
                </Sp>
              </form>
            </Body>
          )}
        {termsWereAccepted &&
          passwordWasDefined &&
          !mnemonicWasAccepted && (
            <Body>
              <Title>Recovery Passphrase</Title>
              <Sp mt={2}>
                <Message>
                  Copy the following word list and keep it in a safe place. You
                  will need these to recover your wallet in the future—don’t
                  lose it.
                </Message>
              </Sp>
              <Sp mt={3} mx={-8}>
                <Mnemonic>{mnemonic}</Mnemonic>
              </Sp>
              <Sp mt={6}>
                <Btn block onClick={this.onMnemonicAccepted}>
                  Done
                </Btn>
              </Sp>
            </Body>
          )}
        {termsWereAccepted &&
          passwordWasDefined &&
          mnemonicWasAccepted && (
            <Body>
              <Title>Contacting Network...</Title>
              <Sp mt={9}>
                <LoadingBar />
              </Sp>
            </Body>
          )}
      </Container>
    )
  }
}

export default connect(null, actions)(Onboarding)
