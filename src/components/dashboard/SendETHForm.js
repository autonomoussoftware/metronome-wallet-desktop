import withSendETHFormState from 'metronome-wallet-ui-logic/src/hocs/withSendETHFormState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import {
  ConfirmationWizard,
  AmountFields,
  DisplayValue,
  GasEditor,
  TextInput,
  Flex,
  Btn,
  Sp
} from '../common'

const ConfirmationContainer = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;

  & > div {
    color: ${p => p.theme.colors.primary};
  }
`

const Footer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  padding: 3.2rem 2.4rem;
  flex-grow: 1;
  height: 100%;
`

class SendETHForm extends React.Component {
  static propTypes = {
    gasEstimateError: PropTypes.bool,
    ethPlaceholder: PropTypes.string,
    usdPlaceholder: PropTypes.string,
    onInputChange: PropTypes.func.isRequired,
    useCustomGas: PropTypes.bool.isRequired,
    onMaxClick: PropTypes.func.isRequired,
    ethAmount: PropTypes.string,
    usdAmount: PropTypes.string,
    toAddress: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    gasPrice: PropTypes.string,
    gasLimit: PropTypes.string,
    errors: PropTypes.shape({
      toAddress: PropTypes.string
    }).isRequired,
    tabs: PropTypes.node.isRequired
  }

  renderConfirmation = () => (
    <ConfirmationContainer data-testid="confirmation">
      You will send{' '}
      <DisplayValue inline value={this.props.ethAmount} toWei post=" ETH" />{' '}
      {this.props.usdAmount ? `($${this.props.usdAmount})` : `(< $0.01)`} to the
      address {this.props.toAddress}.
    </ConfirmationContainer>
  )

  renderForm = goToReview => (
    <Flex.Column grow="1">
      {this.props.tabs}
      <Sp py={4} px={3}>
        <form
          data-testid="sendEth-form"
          noValidate
          onSubmit={goToReview}
          id="sendForm"
        >
          <TextInput
            placeholder="e.g. 0x2345678998765434567"
            data-testid="toAddress-field"
            autoFocus
            onChange={this.props.onInputChange}
            error={this.props.errors.toAddress}
            label="Send to Address"
            value={this.props.toAddress}
            id="toAddress"
          />
          <Sp mt={3}>
            <AmountFields
              ethPlaceholder={this.props.ethPlaceholder}
              usdPlaceholder={this.props.usdPlaceholder}
              onMaxClick={this.props.onMaxClick}
              ethAmount={this.props.ethAmount}
              usdAmount={this.props.usdAmount}
              onChange={this.props.onInputChange}
              errors={this.props.errors}
            />
          </Sp>
          <Sp mt={3}>
            <GasEditor
              gasEstimateError={this.props.gasEstimateError}
              onInputChange={this.props.onInputChange}
              useCustomGas={this.props.useCustomGas}
              gasLimit={this.props.gasLimit}
              gasPrice={this.props.gasPrice}
              errors={this.props.errors}
            />
          </Sp>
        </form>
      </Sp>
      <Footer>
        <Btn block submit form="sendForm">
          Review Send
        </Btn>
      </Footer>
    </Flex.Column>
  )

  render() {
    return (
      <ConfirmationWizard
        renderConfirmation={this.renderConfirmation}
        onWizardSubmit={this.props.onSubmit}
        renderForm={this.renderForm}
        validate={this.props.validate}
      />
    )
  }
}

export default withSendETHFormState(SendETHForm)
