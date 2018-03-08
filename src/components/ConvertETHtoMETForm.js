import { sendToMainProcess, toETH, toUSD, isWeiable, weiToGwei } from '../utils'
import { DisplayValue, Flex, Btn, Sp } from './common'
import ConfirmationWizard from './ConfirmationWizard'
import ConverterEstimates from './ConverterEstimates'
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
    useCustomGas: false,
    ethAmount: null,
    usdAmount: null,
    estimate: null,
    gasPrice: weiToGwei(config.DEFAULT_GAS_PRICE),
    gasLimit: config.MET_DEFAULT_GAS_LIMIT,
    errors: {}
  }

  onInputChange = e => {
    const { id, value } = e.target
    const { ETHprice } = this.props

    this.setState(state => ({
      ...state,
      usdAmount: id === 'ethAmount' ? toUSD(value, ETHprice) : state.usdAmount,
      ethAmount: id === 'usdAmount' ? toETH(value, ETHprice) : state.ethAmount,
      errors: { ...state.errors, [id]: null },
      [id]: value
    }))

    // Estimate gas limit again if parameters changed
    if (['ethAmount'].includes(id)) this.getGasEstimate()
  }

  getGasEstimate = debounce(() => {
    const { ethAmount } = this.state

    if (!isWeiable(ethAmount)) return

    sendToMainProcess('metronome-convert-eth-gas-limit', {
      value: Web3.utils.toWei(ethAmount.replace(',', '.')),
      from: this.props.from
    })
      .then(({ gasLimit }) => this.setState({ gasLimit: gasLimit.toString() }))
      .catch(err => console.warn('Gas estimation failed', err))
  }, 500)

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
    return sendToMainProcess('mtn-convert-eth', {
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
      <ConfirmationContainer>
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
          <form onSubmit={goToReview} id="convertForm" noValidate>
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
