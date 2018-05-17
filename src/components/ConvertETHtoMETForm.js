import { DisplayValue, Flex, Btn, Sp } from './common'
import ConfirmationWizard from './ConfirmationWizard'
import ConverterEstimates from './ConverterEstimates'
import * as validators from '../validator'
import * as selectors from '../selectors'
import AmountFields from './AmountFields'
import { debounce } from 'lodash'
import { connect } from 'react-redux'
import * as utils from '../utils'
import GasEditor from './GasEditor'
import PropTypes from 'prop-types'
import styled from 'styled-components'
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
    calculatingMax: false,
    ...AmountFields.initialState,
    ...GasEditor.initialState('MET'),
    estimate: null,
    errors: {}
  }

  onInputChange = e => {
    const { id, value } = e.target
    const { ETHprice } = this.props

    this.setState(state => ({
      ...state,
      ...AmountFields.onInputChange(state, ETHprice, id, value),
      errors: { ...state.errors, [id]: null },
      [id]: value
    }))

    // Estimate gas limit again if parameters changed
    if (['ethAmount'].includes(id)) this.updateGasLimit(value)
  }

  getGasEstimate = ethAmount => {
    if (!utils.isWeiable(ethAmount)) {
      return Promise.reject(new Error(`${ethAmount} is an invalid value`))
    }
    return utils.sendToMainProcess('metronome-convert-eth-gas-limit', {
      value: Web3.utils.toWei(ethAmount.replace(',', '.')),
      from: this.props.from
    })
  }

  updateGasLimit = debounce(ethAmount => {
    this.getGasEstimate(ethAmount)
      .then(({ gasLimit }) => {
        this.setState({ gasLimit: gasLimit.toString() })
        return { gasLimit }
      })
      .catch(err => console.warn('Gas estimation failed: ', err.message))
  }, 500)

  setMax = gasLimit => {
    const max = utils.calculateMaxAmount(
      this.props.availableETH,
      this.state.gasPrice,
      gasLimit
    )
    this.onInputChange({ target: { id: 'ethAmount', value: max } })
    this.setState({ calculatingMax: false })
  }

  onMaxClick = () => {
    this.setState({ calculatingMax: true })
    this.getGasEstimate(Web3.utils.fromWei(this.props.availableETH))
      .then(({ gasLimit }) => this.setMax(gasLimit))
      .catch(() => this.setMax(this.state.gasLimit))
  }

  validate = () => {
    const { ethAmount, gasPrice, gasLimit } = this.state
    const max = Web3.utils.fromWei(this.props.availableETH)
    const errors = {
      ...validators.validateEthAmount(ethAmount, max),
      ...validators.validateGasPrice(gasPrice),
      ...validators.validateGasLimit(gasLimit)
    }
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) this.setState({ errors })
    return !hasErrors
  }

  onWizardSubmit = password => {
    return utils.sendToMainProcess('mtn-convert-eth', {
      gasPrice: Web3.utils.toWei(this.state.gasPrice, 'gwei'),
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
        <DisplayValue value={Web3.utils.toWei(ethAmount)} post=" ETH" inline />{' '}
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
              calculatingMax={this.state.calculatingMax}
              onMaxClick={this.onMaxClick}
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
          </form>
        </Sp>
        <Footer>
          <Btn block submit form="convertForm">
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
