import { TextInput, FieldBtn, Flex, Sp } from './common'
import { sendToMainProcess, weiToGwei } from '../utils'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const GasLabel = styled.span`
  opacity: 0.5;
  font-size: 1.3rem;
  white-space: nowrap;
  margin-right: 1em;
`

export default class GasEditor extends React.Component {
  static propTypes = {
    useCustomGas: PropTypes.bool.isRequired,
    gasPrice: PropTypes.string.isRequired,
    gasLimit: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.shape({
      gasPrice: PropTypes.string,
      gasLimit: PropTypes.string
    }).isRequired
  }

  componentDidMount() {
    // Avoid getting current price if using custom price
    if (this.props.useCustomGas) return

    sendToMainProcess('get-gas-price', {})
      .then(({ gasPrice }) => {
        this.props.onChange({
          target: { id: 'gasPrice', value: weiToGwei(gasPrice) }
        })
      })
      .catch(err => console.warn('Gas price request failed', err))
  }

  onGasToggle = () => {
    const { useCustomGas, onChange } = this.props
    onChange({ target: { id: 'useCustomGas', value: !useCustomGas } })
  }

  render() {
    const { useCustomGas, gasPrice, gasLimit, errors, onChange } = this.props

    return useCustomGas ? (
      <Flex.Row justify="space-between">
        <Flex.Item grow="1" basis="0">
          <TextInput
            onChange={onChange}
            label="Gas Limit (Units)"
            error={errors.gasLimit}
            value={gasLimit}
            id="gasLimit"
          />
        </Flex.Item>
        <Sp mt={6} mx={2.5} />
        <Flex.Item grow="1" basis="0">
          <TextInput
            onChange={onChange}
            label="Gas Price (Gwei)"
            error={errors.gasPrice}
            value={gasPrice}
            id="gasPrice"
          />
        </Flex.Item>
      </Flex.Row>
    ) : (
      <Flex.Row justify="space-between" align="flex-start">
        <Flex.Row rowwrap shrink="1">
          <GasLabel>Gas Limit: {gasLimit} (Units)</GasLabel>
          <GasLabel>Gas Price: {gasPrice} (Gwei)</GasLabel>
        </Flex.Row>
        <FieldBtn onClick={this.onGasToggle} tabIndex="-1">
          EDIT GAS
        </FieldBtn>
      </Flex.Row>
    )
  }
}
