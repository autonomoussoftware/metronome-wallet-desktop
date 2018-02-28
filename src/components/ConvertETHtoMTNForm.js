import { FloatBtn, TextInput, TxIcon, Flex, Btn, Sp } from './common'
import { sendToMainProcess, toETH, toUSD, isWeiable, weiToGwei } from '../utils'
import config from '../config'
import ConverterEstimates from './ConverterEstimates'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Web3 from 'web3'

import {
  validateEthAmount,
  validatePassword,
  validateGasPrice,
  validateGasLimit
} from '../validator'

const GasLabel = styled.span`
  opacity: 0.5;
  font-size: 1.3rem;
  white-space: nowrap;
`

const ErrorMsg = styled.p`
  color: red;
`

const Footer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  padding: 6.4rem 2.4rem;
  flex-grow: 1;
  height: 100%;
`

class ConvertETHtoMTNForm extends React.Component {
  static propTypes = {
    availableETH: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired,
    ETHprice: PropTypes.number.isRequired,
    from: PropTypes.string.isRequired
  }

  state = {
    ethAmount: null,
    usdAmount: null,
    password: null,
    status: 'init',
    showGasFields: false,
    gasPrice: weiToGwei(config.DEFAULT_GAS_PRICE),
    gasLimit: config.MET_DEFAULT_GAS_LIMIT,
    errors: {},
    error: null
  }

  componentDidMount() {
    sendToMainProcess('get-gas-price', {})
      .then(({ gasPrice }) => this.setState({ gasPrice: weiToGwei(gasPrice) }))
      .catch(err => console.warn('Gas price falied', err))
  }

  onGasClick = () => {
    this.setState({ showGasFields: !this.state.showGasFields })
  }

  onMaxClick = () => {
    const ethAmount = Web3.utils.fromWei(this.props.availableETH)
    this.setState({
      usdAmount: toUSD(ethAmount, this.props.ETHprice),
      ethAmount
    })
  }

  onInputBlur = e => {
    const { ethAmount } = this.state

    if (!ethAmount || !isWeiable(ethAmount)) {
      return
    }

    sendToMainProcess('metronome-convert-eth-gas-limit', {
      from: this.props.from,
      value: Web3.utils.toWei(ethAmount.replace(',', '.'))
    })
      .then(({ gasLimit }) => this.setState({ gasLimit: gasLimit.toString() }))
      .catch(err => console.warn('Gas estimation failed', err))
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
  }

  onSubmit = e => {
    e.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    const { password, ethAmount, gasPrice, gasLimit } = this.state

    this.setState({ status: 'pending', error: null, errors: {} }, () =>
      sendToMainProcess('mtn-convert-eth', {
        password,
        value: Web3.utils.toWei(ethAmount.replace(',', '.')),
        from: this.props.from,
        gasLimit,
        gasPrice: Web3.utils.toWei(gasPrice, 'gwei')
      })
        .then(this.props.onSuccess)
        .catch(err =>
          this.setState({
            status: 'failure',
            error: err.message || 'Unknown error'
          })
        )
    )
  }

  validate = () => {
    const { password, ethAmount, gasPrice, gasLimit } = this.state
    const max = Web3.utils.fromWei(this.props.availableETH)

    return {
      ...validateEthAmount(ethAmount, max),
      ...validatePassword(password),
      ...validateGasPrice(gasPrice),
      ...validateGasLimit(gasLimit)
    }
  }

  render() {
    const {
      ethAmount,
      usdAmount,
      password,
      status: convertStatus,
      errors,
      error,
      gasPrice,
      gasLimit,
      showGasFields
    } = this.state

    return (
      <Flex.Column grow="1">
        <Sp pt={4} pb={3} px={3}>
          <form onSubmit={this.onSubmit} id="convertForm" noValidate>
            <Flex.Row justify="space-between">
              <Flex.Item grow="1" basis="0">
                <FloatBtn onClick={this.onMaxClick} tabIndex="-1">
                  MAX
                </FloatBtn>
                <TextInput
                  placeholder="0.00"
                  autoFocus
                  onChange={this.onInputChange}
                  onBlur={this.onInputBlur}
                  label="Amount (ETH)"
                  value={ethAmount}
                  error={errors.ethAmount}
                  disabled={convertStatus !== 'init'}
                  id="ethAmount"
                />
              </Flex.Item>
              <Sp mt={6} mx={1}>
                <TxIcon />
              </Sp>
              <Flex.Item grow="1" basis="0">
                <TextInput
                  placeholder="0.00"
                  onChange={this.onInputChange}
                  onBlur={this.onInputBlur}
                  label="Amount (USD)"
                  value={usdAmount}
                  error={errors.usdAmount}
                  disabled={convertStatus !== 'init'}
                  id="usdAmount"
                />
              </Flex.Item>
            </Flex.Row>
            <Sp my={3}>
              <TextInput
                type="password"
                onChange={this.onInputChange}
                label="Password"
                value={password}
                error={errors.password}
                disabled={convertStatus !== 'init'}
                id="password"
              />
            </Sp>

            <Sp mt={4} mb={2}>
              <Flex.Row justify="space-between">
                <Flex.Item grow="1" basis="0">
                  {showGasFields ? (
                    <TextInput
                      type="number"
                      onChange={this.onInputChange}
                      min="1"
                      error={errors.gasLimit}
                      label="Gas Limt (UNITS)"
                      value={gasLimit}
                      id="gasLimit"
                    />
                  ) : (
                    <GasLabel>Gas Limit: {gasLimit} (UNITS)</GasLabel>
                  )}
                </Flex.Item>

                {showGasFields && <Sp mt={6} mx={1} />}

                <Flex.Item grow="1" basis="0">
                  {showGasFields ? (
                    <TextInput
                      type="number"
                      min="1"
                      onChange={this.onInputChange}
                      error={errors.gasPrice}
                      label="Gas Price (GWEI)"
                      value={gasPrice}
                      id="gasPrice"
                    />
                  ) : (
                    <GasLabel>Gas Price: {gasPrice} (GWEI)</GasLabel>
                  )}
                </Flex.Item>

                {!showGasFields && (
                  <Flex.Item basis="0">
                    <FloatBtn onClick={this.onGasClick} tabIndex="-1">
                      EDIT GAS
                    </FloatBtn>
                  </Flex.Item>
                )}
              </Flex.Row>
            </Sp>
            <ConverterEstimates amount={ethAmount} convertTo="MET" />
          </form>
        </Sp>
        <Footer>
          <Btn
            disabled={convertStatus === 'pending'}
            block
            submit
            form="convertForm"
          >
            {convertStatus === 'pending' ? 'Converting...' : 'Convert'}
          </Btn>
          {error && <ErrorMsg>{error}</ErrorMsg>}
        </Footer>
      </Flex.Column>
    )
  }
}

const mapStateToProps = state => ({
  availableETH: selectors.getEthBalanceWei(state),
  ETHprice: selectors.getEthRate(state),
  from: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(ConvertETHtoMTNForm)
