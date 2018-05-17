import { DisplayValue, TextInput, Flex, Btn, Sp } from './common'
import ConfirmationWizard from './ConfirmationWizard'
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

class SendETHForm extends React.Component {
  static propTypes = {
    availableETH: PropTypes.string.isRequired,
    ETHprice: PropTypes.number.isRequired,
    from: PropTypes.string.isRequired,
    tabs: PropTypes.node
  }

  state = {
    calculatingMax: false,
    ...AmountFields.initialState,
    ...GasEditor.initialState('ETH'),
    toAddress: null,
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
    return utils.sendToMainProcess('get-gas-limit', {
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
    const { ethAmount, toAddress, gasPrice, gasLimit } = this.state
    const max = Web3.utils.fromWei(this.props.availableETH)
    const errors = {
      ...validators.validateToAddress(toAddress),
      ...validators.validateEthAmount(ethAmount, max),
      ...validators.validateGasPrice(gasPrice),
      ...validators.validateGasLimit(gasLimit)
    }
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) this.setState({ errors })
    return !hasErrors
  }

  onWizardSubmit = password => {
    return utils.sendToMainProcess('send-eth', {
      gasPrice: Web3.utils.toWei(this.state.gasPrice, 'gwei'),
      gasLimit: this.state.gasLimit,
      password,
      value: Web3.utils.toWei(this.state.ethAmount.replace(',', '.')),
      from: this.props.from,
      to: this.state.toAddress
    })
  }

  renderConfirmation = () => {
    const { ethAmount, usdAmount, toAddress } = this.state
    return (
      <ConfirmationContainer data-testid="confirmation">
        You will send{' '}
        <DisplayValue value={Web3.utils.toWei(ethAmount)} post=" ETH" inline />{' '}
        (${usdAmount}) to the address {toAddress}.
      </ConfirmationContainer>
    )
  }

  renderForm = goToReview => {
    return (
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
              onChange={this.onInputChange}
              error={this.state.errors.toAddress}
              label="Send to Address"
              value={this.state.toAddress}
              id="toAddress"
            />
            <Sp mt={3}>
              <AmountFields
                calculatingMax={this.state.calculatingMax}
                onMaxClick={this.onMaxClick}
                ethAmount={this.state.ethAmount}
                usdAmount={this.state.usdAmount}
                onChange={this.onInputChange}
                errors={this.state.errors}
              />
            </Sp>
            <Sp mt={3}>
              <GasEditor
                useCustomGas={this.state.useCustomGas}
                onChange={this.onInputChange}
                gasPrice={this.state.gasPrice}
                gasLimit={this.state.gasLimit}
                errors={this.state.errors}
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
  }

  render() {
    return (
      <ConfirmationWizard
        renderConfirmation={this.renderConfirmation}
        onWizardSubmit={this.onWizardSubmit}
        renderForm={this.renderForm}
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

export default connect(mapStateToProps)(SendETHForm)
