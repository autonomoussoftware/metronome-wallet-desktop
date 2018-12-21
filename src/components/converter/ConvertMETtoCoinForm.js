import withConvertMETtoCoinState from 'metronome-wallet-ui-logic/src/hocs/withConvertMETtoCoinState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import ConverterEstimates from './ConverterEstimates'
import MinReturnCheckbox from './MinReturnCheckbox'
import {
  ConfirmationWizard,
  DisplayValue,
  GasEditor,
  FieldBtn,
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

class ConvertMETtoCoinForm extends React.Component {
  static propTypes = {
    onUseMinimumToggle: PropTypes.func.isRequired,
    gasEstimateError: PropTypes.bool,
    metPlaceholder: PropTypes.string,
    onInputChange: PropTypes.func.isRequired,
    estimateError: PropTypes.string,
    useCustomGas: PropTypes.bool.isRequired,
    onMaxClick: PropTypes.func.isRequired,
    useMinimum: PropTypes.bool.isRequired,
    metAmount: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    gasPrice: PropTypes.string,
    gasLimit: PropTypes.string,
    estimate: PropTypes.string,
    errors: PropTypes.shape({
      useMinimum: PropTypes.string,
      metAmount: PropTypes.string
    }).isRequired,
    tabs: PropTypes.node.isRequired,
    rate: PropTypes.string
  }

  renderConfirmation = () => {
    const { metAmount, estimate, rate } = this.props
    return (
      <ConfirmationContainer data-testid="confirmation">
        You will convert <DisplayValue inline value={metAmount} post=" MET" />{' '}
        and get approximately{' '}
        <DisplayValue value={estimate} post=" ETH" inline />, which means a rate
        of <DisplayValue value={rate} post=" ETH/MET" />.
      </ConfirmationContainer>
    )
  }

  renderForm = goToReview => (
    <Flex.Column grow="1">
      {this.props.tabs}
      <Sp py={4} px={3}>
        <form
          data-testid="metToCoin-form"
          noValidate
          onSubmit={goToReview}
          id="convertForm"
        >
          <div>
            <FieldBtn
              data-testid="max-btn"
              tabIndex="-1"
              onClick={this.props.onMaxClick}
              float
            >
              MAX
            </FieldBtn>
            <TextInput
              placeholder={this.props.metPlaceholder}
              data-testid="metAmount-field"
              autoFocus
              onChange={this.props.onInputChange}
              error={this.props.errors.metAmount}
              label="Amount (MET)"
              value={this.props.metAmount}
              id="metAmount"
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
              convertTo="ETH"
              estimate={this.props.estimate}
              rate={this.props.rate}
            />
            <MinReturnCheckbox
              useMinimum={this.props.useMinimum}
              onToggle={this.props.onUseMinimumToggle}
              label="Get expected ETH amount or cancel"
              error={this.props.errors.useMinimum}
            />
          </div>
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
        pendingTitle="Converting MET..."
        pendingText="This may take a while. You can close this and follow the status of the conversion in the transaction list."
        renderForm={this.renderForm}
        editLabel="Edit this conversion"
        validate={this.props.validate}
      />
    )
  }
}

export default withConvertMETtoCoinState(ConvertMETtoCoinForm)
