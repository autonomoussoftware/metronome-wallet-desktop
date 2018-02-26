import { BaseBtn, TextInput, Flex, Btn, Sp } from './common'
import { sendToMainProcess } from '../utils'
import ConverterEstimates from './ConverterEstimates'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Web3 from 'web3'

import {
  validateMtnAmount,
  validatePassword,
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

const ErrorMsg = styled.p`
  color: red;
`

const Footer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  padding: 6.4rem 2.4rem;
  flex-grow: 1;
  height: 100%;
`

class ConvertMTNtoETHForm extends React.Component {
  static propTypes = {
    availableMTN: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired,
    from: PropTypes.string.isRequired
  }

  state = {
    mtnAmount: null,
    password: null,
    status: 'init',
    showGasFields: false,
    gasPrice: '1',
    gasLimit: '21000',
    errors: {},
    error: null
  }

  componentDidMount() {
    sendToMainProcess('get-gas-price', {}).then(({ gasPrice }) => {
      this.setState({ gasPrice: (gasPrice / 1000000000).toString() })
    })
  }

  onGasClick = () => {
    this.setState({ showGasFields: !this.state.showGasFields })
  }

  onMaxClick = () => {
    const mtnAmount = Web3.utils.fromWei(this.props.availableMTN)
    this.setState({ mtnAmount })
  }

  onInputChange = e => {
    const { id, value } = e.target
    this.setState(state => ({
      ...state,
      [id]: value,
      errors: { ...state.errors, [id]: null }
    }))
  }

  onInputBlur = e => {
    const { mtnAmount } = this.state

    if (!mtnAmount) {
      return
    }

    console.log('Input Blur')
    sendToMainProcess('mtn-convert-mtn-gas-price', {
      from: this.props.from,
      value: Web3.utils.toWei(mtnAmount.replace(',', '.'))
    }).then(({ gasLimit }) => {
      console.log('Input Blur 2')
      this.setState({ gasLimit: gasLimit.toString() })
    })
  }

  onSubmit = e => {
    e.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    const { password, mtnAmount, gasPrice, gasLimit } = this.state

    this.setState({ status: 'pending', error: null, errors: {} }, () =>
      sendToMainProcess(
        'mtn-convert-mtn',
        {
          password,
          value: Web3.utils.toWei(mtnAmount.replace(',', '.')),
          from: this.props.from,
          gasLimit,
          gasPrice
        },
        600000
      ) // timeout to 10 minute
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
    const { password, mtnAmount, gasPrice, gasLimit } = this.state
    const max = Web3.utils.fromWei(this.props.availableMTN)

    return {
      ...validateMtnAmount(mtnAmount, max),
      ...validatePassword(password),
      ...validateGasPrice(gasPrice),
      ...validateGasLimit(gasLimit)
    }
  }

  render() {
    const {
      mtnAmount,
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
          <form onSubmit={this.onSubmit} id="convertForm">
            <div>
              <FloatBtn onClick={this.onMaxClick} tabIndex="-1">
                MAX
              </FloatBtn>
              <TextInput
                placeholder="0.00"
                autoFocus
                onChange={this.onInputChange}
                onBlur={this.onInputBlur}
                error={errors.mtnAmount}
                label="Amount (MET)"
                value={mtnAmount}
                id="mtnAmount"
              />
              <Sp my={3}>
                <TextInput
                  onChange={this.onInputChange}
                  disabled={convertStatus !== 'init'}
                  error={errors.password}
                  label="Password"
                  value={password}
                  type="password"
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
              <ConverterEstimates amount={mtnAmount} convertTo="ETH" />
            </div>
          </form>
        </Sp>
        <Footer>
          <Btn
            disabled={convertStatus === 'pending'}
            submit
            block
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
  availableMTN: selectors.getMtnBalanceWei(state),
  from: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(ConvertMTNtoETHForm)
