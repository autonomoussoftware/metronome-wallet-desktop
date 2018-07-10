import { sendToMainProcess, isWeiable } from '../utils'
import { DisplayValue, Flex, Btn, Sp } from './common'
import ConfirmationWizard from './ConfirmationWizard'
import ConverterEstimates from './ConverterEstimates'
import MinReturnCheckbox from './MinReturnCheckbox'
import * as validators from '../validator'
import * as selectors from '../selectors'
import AmountFields from './AmountFields'
import { debounce } from 'lodash'
import { connect } from 'react-redux'
import GasEditor from './GasEditor'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import config from '../config'
import React from 'react'
import Web3 from 'web3'

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

class ConvertETHtoMETForm extends React.Component {
  static propTypes = {
    availableETH: PropTypes.string.isRequired,
    ETHprice: PropTypes.number.isRequired,
    from: PropTypes.string.isRequired,
    tabs: PropTypes.node
  }

  state = {
    ...AmountFields.initialState,
    ...GasEditor.initialState('MET'),
    useMinimum: true,
    estimate: null,
    errors: {}
  }

  onInputChange = e => {
    const { id, value } = e.target
    const { ETHprice } = this.props

    this.setState(state => ({
      ...state,
      ...AmountFields.onInputChange(state, ETHprice, id, value),
      errors: {
        ...state.errors,
        [id]: null,
        useMinimum:
          id === 'estimate' && value !== null ? null : state.errors.useMinimum
      },
      [id]: value
    }))

    // Estimate gas limit again if parameters changed
    if (['ethAmount'].includes(id)) this.getGasEstimate()
  }

  onUseMinimumToggle = () =>
    this.setState(state => ({
      ...state,
      useMinimum: !state.useMinimum,
      errors: {
        ...state.errors,
        useMinimum: null
      }
    }))

  getGasEstimate = debounce(() => {
    const { ethAmount } = this.state

    if (!isWeiable(ethAmount)) return

    sendToMainProcess('metronome-convert-eth-gas-limit', {
      value: Web3.utils.toWei(ethAmount.replace(',', '.')),
      from: this.props.from
    })
      .then(({ gasLimit }) => this.setState({ gasLimit: gasLimit.toString() }))
      .catch(err => console.warn('Gas estimation failed', err)) // eslint-disable-line no-console
  }, 500)

  validate = () => {
    const { ethAmount, gasPrice, gasLimit, estimate, useMinimum } = this.state
    const max = Web3.utils.fromWei(this.props.availableETH)
    const errors = {
      ...validators.validateEthAmount(ethAmount, max),
      ...validators.validateGasPrice(gasPrice, config.MAX_GAS_PRICE),
      ...validators.validateGasLimit(gasLimit),
      ...validators.validateUseMinimum(useMinimum, estimate)
    }
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) this.setState({ errors })
    return !hasErrors
  }

  onWizardSubmit = password => {
    return sendToMainProcess('mtn-convert-eth', {
      minReturn:
        this.state.useMinimum && typeof this.state.estimate === 'string'
          ? this.state.estimate
          : undefined,
      gasPrice: Web3.utils.toWei(this.state.gasPrice.replace(',', '.'), 'gwei'),
      gasLimit: this.state.gasLimit,
      password,
      value: Web3.utils.toWei(this.state.ethAmount.replace(',', '.')),
      from: this.props.from
    })
  }

  renderConfirmation = () => {
    const { ethAmount, usdAmount, estimate } = this.state
    return (
      <ConfirmationContainer data-testid="confirmation">
        You will convert{' '}
        <DisplayValue
          inline
          value={Web3.utils.toWei(ethAmount.replace(',', '.'))}
          post=" ETH"
        />{' '}
        (${usdAmount}) and get approximately{' '}
        <DisplayValue value={estimate} post=" MTN" inline />.
      </ConfirmationContainer>
    )
  }

  renderForm = goToReview => {
    return (
      <Flex.Column grow="1">
        {this.props.tabs}
        <Sp py={4} px={3}>
          <form
            data-testid="ethToMet-form"
            noValidate
            onSubmit={goToReview}
            id="convertForm"
          >
            <AmountFields
              availableETH={this.props.availableETH}
              ethAmount={this.state.ethAmount}
              usdAmount={this.state.usdAmount}
              autoFocus
              onChange={this.onInputChange}
              errors={this.state.errors}
            />
            <Sp mt={3}>
              <GasEditor
                useCustomGas={this.state.useCustomGas}
                onChange={this.onInputChange}
                gasPrice={this.state.gasPrice}
                gasLimit={this.state.gasLimit}
                errors={this.state.errors}
              />
            </Sp>
            <ConverterEstimates
              convertTo="MET"
              estimate={this.state.estimate}
              onChange={this.onInputChange}
              amount={this.state.ethAmount}
            />
            <MinReturnCheckbox
              useMinimum={this.state.useMinimum}
              onToggle={this.onUseMinimumToggle}
              label="Get expected MET amount or cancel"
              error={this.state.errors.useMinimum}
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
  }

  render() {
    return (
      <ConfirmationWizard
        renderConfirmation={this.renderConfirmation}
        onWizardSubmit={this.onWizardSubmit}
        pendingTitle="Converting ETH..."
        renderForm={this.renderForm}
        editLabel="Edit this conversion"
        validate={this.validate}
      />
    )
  }
}

const mapStateToProps = state => ({
  availableETH: selectors.getEthBalanceWei(state),
  ETHprice: selectors.getEthRate(state),
  from: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(ConvertETHtoMETForm)
