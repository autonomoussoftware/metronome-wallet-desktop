import withSendCoinFormState from 'metronome-wallet-ui-logic/src/hocs/withSendCoinFormState'
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

class SendCoinForm extends React.Component {
  static propTypes = {
    addressPlaceholder: PropTypes.string,
    gasEstimateError: PropTypes.bool,
    coinPlaceholder: PropTypes.string,
    usdPlaceholder: PropTypes.string,
    onInputChange: PropTypes.func.isRequired,
    useCustomGas: PropTypes.bool.isRequired,
    coinSymbol: PropTypes.string.isRequired,
    onMaxClick: PropTypes.func.isRequired,
    coinAmount: PropTypes.string,
    usdAmount: PropTypes.string,
    toAddress: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    gasPrice: PropTypes.string,
    gasLimit: PropTypes.string,
    useGas: PropTypes.bool.isRequired,
    errors: PropTypes.shape({
      toAddress: PropTypes.string
    }).isRequired,
    tabs: PropTypes.node.isRequired
  }

  renderConfirmation = () => (
    <ConfirmationContainer data-testid="confirmation">
      You will send{' '}
      <DisplayValue inline value={this.props.coinAmount} toWei isCoin />{' '}
      {this.props.usdAmount ? `($${this.props.usdAmount})` : `(< $0.01)`} to the
      address {this.props.toAddress}.
    </ConfirmationContainer>
  )

  renderForm = goToReview => (
    <Flex.Column grow="1">
      {this.props.tabs}
      <Sp py={4} px={3}>
        <form
          data-testid="sendCoin-form"
          noValidate
          onSubmit={goToReview}
          id="sendForm"
        >
          <TextInput
            placeholder={this.props.addressPlaceholder}
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
              coinPlaceholder={this.props.coinPlaceholder}
              usdPlaceholder={this.props.usdPlaceholder}
              onMaxClick={this.props.onMaxClick}
              coinSymbol={this.props.coinSymbol}
              coinAmount={this.props.coinAmount}
              usdAmount={this.props.usdAmount}
              onChange={this.props.onInputChange}
              errors={this.props.errors}
            />
          </Sp>
          {this.props.useGas && (
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
          )}
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

export default withSendCoinFormState(SendCoinForm)
