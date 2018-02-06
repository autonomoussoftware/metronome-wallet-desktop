import { BaseBtn, TextInput, TxIcon, Flex, Btn, Sp } from '../common'
import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Web3 from 'web3'

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

const Footer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  padding: 6.4rem 2.4rem;
  flex-grow: 1;
  height: 100%;
`

export default class SendMTNForm extends React.Component {
  static propTypes = {
    availableMTN: PropTypes.string.isRequired,
    MTNprice: PropTypes.string.isRequired
  }

  static defaultProps = {
    availableMTN: '123456789012345678',
    MTNprice: '980' // 1 MTN = 980 USD
  }

  state = {
    status: 'init',
    errors: {},
    toAddress: null,
    ethAmount: null,
    usdAmount: null
  }

  onMaxClick = () => {
    this.setState({
      ethAmount: this.props.availableMTN,
      usdAmount: this.toUSD(Web3.utils.fromWei(this.props.availableMTN))
    })
  }

  // Maybe we can extract this kind of helpers to some utils file
  toUSD = ethAmount => {
    let isValidAmount
    let usdAmount
    try {
      usdAmount =
        parseFloat(ethAmount.replace(',', '.'), 10) *
        parseFloat(this.props.MTNprice, 10)
      isValidAmount = usdAmount > 0
    } catch (e) {
      isValidAmount = false
    }

    const expectedUSDamount = isValidAmount ? usdAmount.toString() : '--'

    return expectedUSDamount
  }

  toETH = usdAmount => {
    let isValidAmount
    let weiAmount
    try {
      weiAmount = new BigNumber(Web3.utils.toWei(usdAmount.replace(',', '.')))
      isValidAmount = weiAmount.gt(new BigNumber(0))
    } catch (e) {
      isValidAmount = false
    }

    const expectedETHamount = isValidAmount
      ? weiAmount.dividedBy(new BigNumber(this.props.MTNprice)).toString()
      : '--'

    return expectedETHamount
  }

  onInputchange = e => {
    const { id, value } = e.target

    this.setState(state => ({
      ...state,
      usdAmount: id === 'ethAmount' ? this.toUSD(value) : state.usdAmount,
      ethAmount: id === 'usdAmount' ? this.toETH(value) : state.ethAmount,
      [id]: value
    }))
  }

  onSubmit = e => {
    e.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    // TODO: send transaction
  }

  // Perform validations and return an object of type { fieldId: [String] }
  validate = () => {
    const { toAddress } = this.state
    const errors = {}

    // validations for address field
    if (!toAddress) {
      errors.toAddress = 'Address is required'
    } else if (!Web3.utils.isAddress(this.state.toAddress)) {
      errors.toAddress = 'Invalid address'
    }

    // TODO: other validations

    return errors
  }

  render() {
    const { toAddress, ethAmount, usdAmount, errors } = this.state

    return (
      <Flex.Column grow="1">
        <form onSubmit={this.onSubmit}>
          <Sp pt={4} pb={3} px={3}>
            <TextInput
              placeholder="e.g. 0x2345678998765434567"
              onChange={this.onInputchange}
              error={errors.toAddress}
              label="Send to Address"
              value={toAddress}
              id="toAddress"
            />
            <Sp mt={3}>
              <Flex.Row justify="space-between">
                <Flex.Item grow="1" basis="0">
                  <MaxBtn onClick={this.onMaxClick}>MAX</MaxBtn>
                  <TextInput
                    placeholder="0.00"
                    onChange={this.onInputchange}
                    label="Amount (MNT)"
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
                    onChange={this.onInputchange}
                    label="Amount (USD)"
                    value={usdAmount}
                    error={errors.usdAmount}
                    id="usdAmount"
                  />
                </Flex.Item>
              </Flex.Row>
            </Sp>
          </Sp>
          <Footer>
            <Btn block submit>
              Review Send
            </Btn>
          </Footer>
        </form>
      </Flex.Column>
    )
  }
}
