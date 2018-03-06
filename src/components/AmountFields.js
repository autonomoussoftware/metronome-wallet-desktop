import { TextInput, BaseBtn, TxIcon, Flex, Sp } from './common'
import PropTypes from 'prop-types'
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

  onMaxClick = () => {
    const ethAmount = Web3.utils.fromWei(this.props.availableETH)
    this.props.onChange({ target: { id: 'ethAmount', value: ethAmount } })
  }

  render() {
    const { autoFocus, ethAmount, usdAmount, onChange, errors } = this.props

    return (
      <Flex.Row justify="space-between">
        <Flex.Item grow="1" basis="0">
          <MaxBtn onClick={this.onMaxClick} tabIndex="-1">
            MAX
          </MaxBtn>
          <TextInput
            placeholder="0.00"
            autoFocus={autoFocus}
            onChange={onChange}
            error={errors.ethAmount}
            label="Amount (ETH)"
            value={ethAmount}
            id="ethAmount"
          />
        </Flex.Item>
        <Sp mt={6} mx={1}>
          <TxIcon />
        </Sp>
        <Flex.Item grow="1" basis="0">
          <TextInput
            placeholder="0.00"
            onChange={onChange}
            error={errors.usdAmount}
            label="Amount (USD)"
            value={usdAmount}
            id="usdAmount"
          />
        </Flex.Item>
      </Flex.Row>
    )
  }
}
