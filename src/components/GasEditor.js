import { TextInput, FloatBtn, Flex, Sp } from './common'
import { sendToMainProcess, weiToGwei } from '../utils'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const GasLabel = styled.span`
  opacity: 0.5;
  font-size: 1.3rem;
  white-space: nowrap;
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

    return (
      <Flex.Row justify="space-between">
        <Flex.Item grow="1" basis="0">
          {useCustomGas ? (
            <TextInput
              onChange={onChange}
              label="Gas Limit (UNITS)"
              error={errors.gasLimit}
              value={gasLimit}
              type="number"
              min="1"
              id="gasLimit"
            />
          ) : (
            <GasLabel>Gas Limit: {gasLimit} (UNITS)</GasLabel>
          )}
        </Flex.Item>

        {useCustomGas && <Sp mt={6} mx={2.5} />}

        <Flex.Item grow="1" basis="0">
          {useCustomGas ? (
            <TextInput
              onChange={onChange}
              label="Gas Price (GWEI)"
              error={errors.gasPrice}
              value={gasPrice}
              type="number"
              min="1"
              id="gasPrice"
            />
          ) : (
            <GasLabel>Gas Price: {gasPrice} (GWEI)</GasLabel>
          )}
        </Flex.Item>

        {!useCustomGas && (
          <Flex.Item basis="0">
            <FloatBtn onClick={this.onGasToggle} tabIndex="-1">
              EDIT GAS
            </FloatBtn>
          </Flex.Item>
        )}
      </Flex.Row>
    )
  }
}
