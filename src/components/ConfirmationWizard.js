import PropTypes from 'prop-types'
import styled from 'styled-components'
import theme from 'metronome-wallet-ui-logic/src/theme'
import React from 'react'

import { LoadingBar, TextInput, BaseBtn, Flex, Btn, Sp } from './common'
import { validatePassword } from '../validator'
import * as utils from '../utils'
import CheckIcon from './icons/CheckIcon'
import CloseIcon from './icons/CloseIcon'

const ConfirmationTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 600;
  margin: 0 0 1.6rem 0;
`

const Title = styled.div`
  line-height: 3rem;
  font-size: 2.4rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const Message = styled.div`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const EditBtn = styled(BaseBtn)`
  margin: 1.6rem auto;
  display: block;
  font-size: 1.4rem;
  opacity: 0.7;
  font-weight: 600;
  letter-spacing: 1.4px;
  line-height: 1.8rem;
  text-transform: uppercase;
`

const TryAgainBtn = styled(BaseBtn)`
  color: ${p => p.theme.colors.primary};
  margin-top: 1.6rem;
  font-size: 1.4rem;
`

const BtnContainer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  padding: 3.2rem 2.4rem;
`

const Disclaimer = styled.div`
  font-size: 1.1rem;
  line-height: 1.64;
  padding: 2.4rem;
  letter-spacing: 0.5px;
  opacity: 0.7;
  text-align: justify;
`

const Focusable = styled.div.attrs({
  tabIndex: '-1'
})`
  &:focus {
    outline: none;
  }
`

export default class ConfirmationWizard extends React.Component {
  static propTypes = {
    renderConfirmation: PropTypes.func.isRequired,
    confirmationTitle: PropTypes.string,
    onWizardSubmit: PropTypes.func.isRequired,
    successTitle: PropTypes.string,
    failureTitle: PropTypes.string,
    pendingTitle: PropTypes.string,
    pendingText: PropTypes.string,
    successText: PropTypes.string,
    renderForm: PropTypes.func.isRequired,
    disclaimer: PropTypes.string,
    editLabel: PropTypes.string,
    noCancel: PropTypes.bool,
    validate: PropTypes.func,
    styles: PropTypes.object
  }

  static defaultProps = {
    confirmationTitle: 'Transaction Preview',
    successTitle: 'Success!',
    successText:
      'You can view the status of this transaction in the transaction list.',
    failureTitle: 'Error',
    pendingTitle: 'Sending...',
    editLabel: 'Edit this transaction',
    styles: {}
  }

  static initialState = {
    password: null,
    errors: {},
    status: 'init', // init | confirm | pending | success | failure
    error: null
  }

  state = ConfirmationWizard.initialState

  focusable = null

  goToReview = ev => {
    ev.preventDefault()
    const isValid = !this.props.validate || this.props.validate()
    if (isValid) this.setState({ status: 'confirm', password: null })
  }

  onCancelClick = () => this.setState(ConfirmationWizard.initialState)

  onConfirmClick = ev => {
    ev.preventDefault()

    if (!this.validateConfirmation()) return

    this.setState(
      { status: 'pending' },
      () => (this.focusable ? this.focusable.focus() : null)
    )
    this.props
      .onWizardSubmit(this.state.password)
      .then(result => this.setState({ status: 'success' }))
      .then(() => (this.focusable ? this.focusable.focus() : null))
      .catch(err => this.setState({ status: 'failure', error: err.message }))
  }

  validateConfirmation = () => {
    const errors = validatePassword(this.state.password)
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) this.setState({ errors })
    return !hasErrors
  }

  onPasswordChange = ({ value }) => this.setState({ password: value })

  // eslint-disable-next-line complexity
  render() {
    const { password, errors, status, error } = this.state

    if (status === 'init') return this.props.renderForm(this.goToReview)
    if (status === 'confirm') {
      return (
        <form onSubmit={this.onConfirmClick} data-testid="confirm-form">
          <Sp py={4} px={3} style={this.props.styles.confirmation || {}}>
            {this.props.confirmationTitle && (
              <ConfirmationTitle>
                {this.props.confirmationTitle}
              </ConfirmationTitle>
            )}
            {this.props.renderConfirmation()}
            <Sp mt={2}>
              <TextInput
                data-testid="pass-field"
                autoFocus
                onChange={this.onPasswordChange}
                error={errors.password}
                value={password}
                label="Enter your password to confirm"
                type="password"
                id="password"
              />
            </Sp>
          </Sp>
          <BtnContainer style={this.props.styles.btns || {}}>
            <Btn submit block>
              Confirm
            </Btn>
            {!this.props.noCancel && (
              <EditBtn onClick={this.onCancelClick} data-testid="cancel-btn">
                {this.props.editLabel}
              </EditBtn>
            )}
          </BtnContainer>
          {this.props.disclaimer && (
            <Disclaimer>{this.props.disclaimer}</Disclaimer>
          )}
        </form>
      )
    }
    if (status === 'success') {
      return (
        <Sp my={19} mx={12} data-testid="success">
          <Focusable innerRef={element => (this.focusable = element)}>
            <Flex.Column align="center">
              <CheckIcon color={theme.colors.success} />
              <Sp my={2}>
                <Title>{this.props.successTitle}</Title>
              </Sp>
              {this.props.successText && (
                <Message>{this.props.successText}</Message>
              )}
            </Flex.Column>
          </Focusable>
        </Sp>
      )
    }
    if (status === 'failure') {
      return (
        <Sp my={19} mx={12} data-testid="failure">
          <Flex.Column align="center">
            <CloseIcon color={theme.colors.danger} size="4.8rem" />
            <Sp my={2}>
              <Title>{this.props.failureTitle}</Title>
            </Sp>
            {error && <Message>{utils.messageParser(error)}</Message>}
            <TryAgainBtn
              data-testid="try-again-btn"
              onClick={this.onCancelClick}
              autoFocus
            >
              Try again
            </TryAgainBtn>
          </Flex.Column>
        </Sp>
      )
    }
    return (
      <Sp my={19} mx={12} data-testid="waiting">
        <Focusable innerRef={element => (this.focusable = element)}>
          <Flex.Column align="center">
            <Sp mb={2}>
              <Title>{this.props.pendingTitle}</Title>
            </Sp>
            <LoadingBar />
            {this.props.pendingText && (
              <Sp mt={2}>
                <Message>{this.props.pendingText}</Message>
              </Sp>
            )}
          </Flex.Column>
        </Focusable>
      </Sp>
    )
  }
}
