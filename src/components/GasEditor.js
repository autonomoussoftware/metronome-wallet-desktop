import { TextInput, FieldBtn, Flex, Sp } from './common'
import { sendToMainProcess, weiToGwei } from '../utils'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import config from '../config'
import React from 'react'

const GasLabel = styled.span`
  opacity: 0.5;
  font-size: 1.3rem;
  white-space: nowrap;
  margin-right: 1em;
`

class GasEditor extends React.Component {
  static propTypes = {
    networkGasPrice: PropTypes.string.isRequired,
    useCustomGas: PropTypes.bool.isRequired,
    gasPrice: PropTypes.string.isRequired,
    gasLimit: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    errors: PropTypes.shape({
      gasPrice: PropTypes.string,
      gasLimit: PropTypes.string
    }).isRequired
  }

  static initialState = currency => ({
    useCustomGas: false,
    gasPrice: weiToGwei(config.DEFAULT_GAS_PRICE),
    gasLimit: config[`${currency}_DEFAULT_GAS_LIMIT`]
  })

  componentDidMount() {
    // Avoid getting current price if using custom price
    if (this.props.useCustomGas) return

    // Start using the the cached gas price in store
    this.props.onChange({
      target: { id: 'gasPrice', value: weiToGwei(this.props.networkGasPrice) }
    })

    // But also fetch current gas price in background
    sendToMainProcess('get-gas-price', {})
      .then(({ gasPrice }) => {
        gasPrice = parseFloat(gasPrice) < config.DEFAULT_GAS_PRICE
          ? config.DEFAULT_GAS_PRICE : gasPrice

        this.props.dispatch({ type: 'gas-price-updated', payload: gasPrice })
        this.props.onChange({
          target: { id: 'gasPrice', value: weiToGwei(gasPrice) }
        })
      })
      .catch(err => console.warn('Gas price request failed', err)) // eslint-disable-line no-console
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
            data-testid="gas-limit-field"
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
            data-testid="gas-price-field"
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
        <FieldBtn
          data-testid="edit-gas-btn"
          tabIndex="-1"
          onClick={this.onGasToggle}
        >
          EDIT GAS
        </FieldBtn>
      </Flex.Row>
    )
  }
}

const mapStateToProps = state => ({
  networkGasPrice: selectors.getNetworkGasPrice(state)
})

export default connect(mapStateToProps)(GasEditor)
