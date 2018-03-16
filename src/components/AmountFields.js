import { TextInput, FieldBtn, TxIcon, Flex, Sp } from './common'
import PropTypes from 'prop-types'
import React from 'react'
import Web3 from 'web3'

export default class AmountFields extends React.Component {
  static propTypes = {
    availableETH: PropTypes.string.isRequired,
    ethAmount: PropTypes.string,
    usdAmount: PropTypes.string,
    autoFocus: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.shape({
      ethAmount: PropTypes.string,
      usdAmount: PropTypes.string
    }).isRequired
  }

  static INVALID_PLACEHOLDER = 'Invalid amount'

  onMaxClick = () => {
    const ethAmount = Web3.utils.fromWei(this.props.availableETH)
    this.props.onChange({ target: { id: 'ethAmount', value: ethAmount } })
  }

  render() {
    const { autoFocus, ethAmount, usdAmount, onChange, errors } = this.props

    return (
      <Flex.Row justify="space-between">
        <Flex.Item grow="1" basis="0">
          <FieldBtn onClick={this.onMaxClick} tabIndex="-1" float>
            MAX
          </FieldBtn>
          <TextInput
            placeholder={
              ethAmount === AmountFields.INVALID_PLACEHOLDER
                ? AmountFields.INVALID_PLACEHOLDER
                : '0.00'
            }
            autoFocus={autoFocus}
            onChange={onChange}
            error={errors.ethAmount}
            label="Amount (ETH)"
            value={
              ethAmount === AmountFields.INVALID_PLACEHOLDER ? '' : ethAmount
            }
            id="ethAmount"
          />
        </Flex.Item>
        <Sp mt={6} mx={1}>
          <TxIcon />
        </Sp>
        <Flex.Item grow="1" basis="0">
          <TextInput
            placeholder={
              usdAmount === AmountFields.INVALID_PLACEHOLDER
                ? AmountFields.INVALID_PLACEHOLDER
                : '0.00'
            }
            onChange={onChange}
            error={errors.usdAmount}
            label="Amount (USD)"
            value={
              usdAmount === AmountFields.INVALID_PLACEHOLDER ? '' : usdAmount
            }
            id="usdAmount"
          />
        </Flex.Item>
      </Flex.Row>
    )
  }
}
