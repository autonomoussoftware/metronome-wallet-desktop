import { BaseBtn, TextInput, TxIcon, Flex, Btn, Sp } from './common'
import { sendToMainProcess, toETH, toUSD } from '../utils'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Web3 from 'web3'

import {
  validateEthAmount,
  validatePassword,
  validateToAddress,
  validateGasPrice,
  validateGasLimit
} from '../validator'

const FloatBtn = BaseBtn.extend`
  float: right;
  line-height: 1.8rem;
  opacity: 0.5;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin-top: 0.4rem;
  white-space: nowrap;

  &:hover {
    opacity: 1;
  }
`

const GasLabel = styled.span`
  opacity: 0.5;
  font-size: 1.3rem;
  white-space: nowrap;
`

const ErrorMsg = styled.div`
  color: ${p => p.theme.colors.danger};
  margin-top: 1.6rem;
`

const Footer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  padding: 6.4rem 2.4rem;
  flex-grow: 1;
  height: 100%;
`

class SendETHForm extends React.Component {
  static propTypes = {
    availableETH: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired,
    ETHprice: PropTypes.number.isRequired,
    from: PropTypes.string.isRequired
  }

  state = {
    toAddress: null,
    ethAmount: null,
    usdAmount: null,
    password: null,
    showGasFields: false,
    gasPrice: '1',
    gasLimit: '21000',
    status: 'init',
    errors: {},
    error: null
  }

  componentDidMount() {
    sendToMainProcess('get-gas-price', {}).then(({ gasPrice }) => {
      this.setState({ gasPrice: (gasPrice / 1000000000).toString() })
    })
  }

  onMaxClick = () => {
    const ethAmount = Web3.utils.fromWei(this.props.availableETH)
    this.setState({
      usdAmount: toUSD(ethAmount, this.props.ETHprice),
      ethAmount
    })
  }

  onGasClick = () => {
    this.setState({ showGasFields: !this.state.showGasFields })
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
    if (Object.keys(errors).length > 0) { return this.setState({ errors }) }

    const { toAddress, ethAmount, password, gasLimit, gasPrice } = this.state

    this.setState({ status: 'pending', error: null, errors: {} }, () =>
      sendToMainProcess('send-eth', {
        password,
        value: Web3.utils.toWei(ethAmount.replace(',', '.')),
        from: this.props.from,
        to: toAddress,
        gasLimit,
        gasPrice
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
    const { ethAmount, toAddress, password, gasPrice, gasLimit } = this.state
    const max = Web3.utils.fromWei(this.props.availableETH)

    return {
      ...validateToAddress(toAddress),
      ...validateEthAmount(ethAmount, max),
      ...validatePassword(password),
      ...validateGasPrice(gasPrice),
      ...validateGasLimit(gasLimit)
    }
  }

  render() {
    const {
      toAddress,
      ethAmount,
      usdAmount,
      password,
      status: sendStatus,
      errors,
      error,
      gasPrice,
      gasLimit,
      showGasFields
    } = this.state

    return (
      <Flex.Column grow="1">
        <Sp pt={4} pb={3} px={3}>
          <form onSubmit={this.onSubmit} id="sendForm">
            <TextInput
              placeholder="e.g. 0x2345678998765434567"
              autoFocus
              onChange={this.onInputChange}
              error={errors.toAddress}
              label="Send to Address"
              value={toAddress}
              id="toAddress"
            />
            <Sp mt={3}>
              <Flex.Row justify="space-between">
                <Flex.Item grow="1" basis="0">
                  <FloatBtn onClick={this.onMaxClick} tabIndex="-1">
                    MAX
                  </FloatBtn>
                  <TextInput
                    placeholder="0.00"
                    onChange={this.onInputChange}
                    label="Amount (ETH)"
                    value={ethAmount}
                    error={errors.ethAmount}
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
                    label="Amount (USD)"
                    value={usdAmount}
                    error={errors.usdAmount}
                    id="usdAmount"
                  />
                </Flex.Item>
              </Flex.Row>
            </Sp>
            <Sp my={2}>
              <Flex.Item grow="1" basis="0">
                <TextInput
                  type="password"
                  onChange={this.onInputChange}
                  label="Password"
                  value={password}
                  error={errors.password}
                  id="password"
                />
              </Flex.Item>
            </Sp>
            <Sp mt={4} mb={2}>
              <Flex.Row justify="space-between">
                <Flex.Item grow="1" basis="0">
                  {showGasFields ? (
                    <TextInput
                      type="number"
                      onChange={this.onInputChange}
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
          </form>
        </Sp>
        <Footer>
          <Btn block submit form="sendForm" disabled={sendStatus === 'pending'}>
            {sendStatus === 'pending' ? 'Sending...' : 'Send'}
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

export default connect(mapStateToProps)(SendETHForm)
