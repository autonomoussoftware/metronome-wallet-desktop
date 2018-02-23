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
  validateToAddress
} from '../validator'

const MaxBtn = BaseBtn.extend`
  float: right;
  line-height: 1.8rem;
  opacity: 0.5;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin-top: 0.4rem;

  &:hover {
    opacity: 1;
  }
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
    status: 'init',
    errors: {},
    error: null
  }

  onMaxClick = () => {
    const ethAmount = Web3.utils.fromWei(this.props.availableETH)
    this.setState({
      usdAmount: toUSD(ethAmount, this.props.ETHprice),
      ethAmount
    })
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

  onSubmit = ev => {
    ev.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    const { toAddress, ethAmount, password } = this.state

    this.setState({ status: 'pending', error: null, errors: {} }, () =>
      sendToMainProcess('send-eth', {
        password,
        value: Web3.utils.toWei(ethAmount.replace(',', '.')),
        from: this.props.from,
        to: toAddress
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
    const { ethAmount, toAddress, password } = this.state
    const max = Web3.utils.fromWei(this.props.availableETH)

    return {
      ...validateToAddress(toAddress),
      ...validateEthAmount(ethAmount, max),
      ...validatePassword(password)
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
      error
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
                  <MaxBtn onClick={this.onMaxClick} tabIndex="-1">
                    MAX
                  </MaxBtn>
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
