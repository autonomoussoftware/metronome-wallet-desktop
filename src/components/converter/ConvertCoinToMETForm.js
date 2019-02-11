import withConvertCoinToMETState from 'metronome-wallet-ui-logic/src/hocs/withConvertCoinToMETState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import ConverterEstimates from './ConverterEstimates'
import MinReturnCheckbox from './MinReturnCheckbox'
import {
  ConfirmationWizard,
  AmountFields,
  DisplayValue,
  GasEditor,
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

class ConvertCointoMETForm extends React.Component {
  static propTypes = {
    onUseMinimumToggle: PropTypes.func.isRequired,
    gasEstimateError: PropTypes.bool,
    coinPlaceholder: PropTypes.string,
    usdPlaceholder: PropTypes.string,
    onInputChange: PropTypes.func.isRequired,
    estimateError: PropTypes.string,
    useCustomGas: PropTypes.bool.isRequired,
    coinSymbol: PropTypes.string.isRequired,
    onMaxClick: PropTypes.func.isRequired,
    useMinimum: PropTypes.bool.isRequired,
    coinAmount: PropTypes.string,
    usdAmount: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    gasPrice: PropTypes.string,
    gasLimit: PropTypes.string,
    estimate: PropTypes.string,
    errors: PropTypes.shape({
      useMinimum: PropTypes.string
    }).isRequired,
    tabs: PropTypes.node.isRequired,
    rate: PropTypes.string
  }

  renderConfirmation = () => {
    const { coinAmount, usdAmount, estimate, rate } = this.props
    return (
      <ConfirmationContainer data-testid="confirmation">
        You will convert <DisplayValue inline isCoin value={coinAmount} toWei />{' '}
        {usdAmount ? `($${usdAmount})` : `(< $0.01)`} and get approximately{' '}
        <DisplayValue value={estimate} post=" MET" inline />, which means a rate
        of{' '}
        <DisplayValue
          inline
          value={rate}
          post={` ${this.props.coinSymbol}/MET`}
        />
        .
      </ConfirmationContainer>
    )
  }

  renderForm = goToReview => (
    <Flex.Column grow="1">
      {this.props.tabs}
      <Sp py={4} px={3}>
        <form
          data-testid="coinToMet-form"
          noValidate
          onSubmit={goToReview}
          id="convertForm"
        >
          <AmountFields
            coinPlaceholder={this.props.coinPlaceholder}
            usdPlaceholder={this.props.usdPlaceholder}
            onMaxClick={this.props.onMaxClick}
            coinAmount={this.props.coinAmount}
            coinSymbol={this.props.coinSymbol}
            usdAmount={this.props.usdAmount}
            autoFocus
            onChange={this.props.onInputChange}
            errors={this.props.errors}
          />
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
          <ConverterEstimates
            estimateError={this.props.estimateError}
            coinSymbol={this.props.coinSymbol}
            convertTo="MET"
            estimate={this.props.estimate}
            rate={this.props.rate}
          />
          <MinReturnCheckbox
            useMinimum={this.props.useMinimum}
            onToggle={this.props.onUseMinimumToggle}
            label="Get expected MET amount or cancel"
            error={this.props.errors.useMinimum}
          />
        </form>
      </Sp>
      <Footer>
        <Btn submit block form="convertForm">
          Review Convert
        </Btn>
      </Footer>
    </Flex.Column>
  )

  render() {
    return (
      <ConfirmationWizard
        renderConfirmation={this.renderConfirmation}
        onWizardSubmit={this.props.onSubmit}
        pendingTitle={`Converting ${this.props.coinSymbol}...`}
        renderForm={this.renderForm}
        editLabel="Edit this conversion"
        validate={this.props.validate}
      />
    )
  }
}

export default withConvertCoinToMETState(ConvertCointoMETForm)
