import PropTypes from 'prop-types'
import React from 'react'

import { FieldBtn } from './Btn'
import TextInput from './TextInput'
import TxIcon from '../icons/TxIcon'
import Flex from './Flex'
import Sp from './Spacing'

export default class AmountFields extends React.Component {
  static propTypes = {
    coinPlaceholder: PropTypes.string.isRequired,
    usdPlaceholder: PropTypes.string.isRequired,
    coinSymbol: PropTypes.string.isRequired,
    onMaxClick: PropTypes.func.isRequired,
    coinAmount: PropTypes.string,
    usdAmount: PropTypes.string,
    autoFocus: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.shape({
      coinAmount: PropTypes.string,
      usdAmount: PropTypes.string
    }).isRequired
  }

  render() {
    return (
      <Flex.Row justify="space-between">
        <Flex.Item grow="1" basis="0">
          <FieldBtn
            data-testid="max-btn"
            tabIndex="-1"
            onClick={this.props.onMaxClick}
            float
          >
            MAX
          </FieldBtn>
          <TextInput
            placeholder={this.props.coinPlaceholder}
            data-testid="coinAmount-field"
            autoFocus={this.props.autoFocus}
            onChange={this.props.onChange}
            error={this.props.errors.coinAmount}
            value={this.props.coinAmount}
            label={`Amount (${this.props.coinSymbol})`}
            id="coinAmount"
          />
        </Flex.Item>
        <Sp mt={6} mx={1}>
          <TxIcon />
        </Sp>
        <Flex.Item grow="1" basis="0">
          <TextInput
            placeholder={this.props.usdPlaceholder}
            data-testid="usdAmount-field"
            onChange={this.props.onChange}
            error={this.props.errors.usdAmount}
            value={this.props.usdAmount}
            label="Amount (USD)"
            id="usdAmount"
          />
        </Flex.Item>
      </Flex.Row>
    )
  }
}
