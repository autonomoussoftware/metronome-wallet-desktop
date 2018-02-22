import { BaseBtn, TextInput, Flex, Btn, Sp } from './common'
import { sendToMainProcess } from '../utils'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import config from '../config'
import React from 'react'
import Web3 from 'web3'
import {
  validateMtnAmount,
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

class SendMTNForm extends React.Component {
  static propTypes = {
    availableMTN: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired,
    from: PropTypes.string.isRequired
  }

  state = {
    mtnAmount: null,
    toAddress: null,
    gasPrice: '0',
    gasLimit: '0',
    showGasFields: false,
    password: null,
    status: 'init',
    errors: {},
    error: null
  }

  componentDidMount() {
    sendToMainProcess('get-gas-price', {}).then(({gasPrice}) => {
      console.log(gasPrice)
      this.setState({ gasPrice })
    })
  }

  onMaxClick = () => {
    const mtnAmount = Web3.utils.fromWei(this.props.availableMTN)
    this.setState({ mtnAmount })
  }

  onGasClick = () => {
    this.setState({ showGasFields: !this.state.showGasFields })
  }

  onInputChange = e => {
    const { id, value } = e.target
    this.setState(state => ({
      [id]: value,
      errors: { ...state.errors, [id]: null }
    }))
  }

  onSubmit = ev => {
    ev.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    const { password, toAddress, mtnAmount } = this.state

    this.setState({ status: 'pending', error: null, errors: {} }, () =>
      sendToMainProcess('send-token', {
        password,
        value: Web3.utils.toWei(mtnAmount.replace(',', '.')),
        token: config.MTN_TOKEN_ADDR,
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

  // Perform validations and return an object of type { fieldId: [String] }
  validate = () => {
    const { password, toAddress, mtnAmount } = this.state
    const max = Web3.utils.fromWei(this.props.availableMTN)

    return {
      ...validateToAddress(toAddress),
      ...validateMtnAmount(mtnAmount, max),
      ...validatePassword(password)
    }
  }

  render() {
    const {
      toAddress,
      mtnAmount,
      password,
      errors,
      status: sendStatus,
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
              <MaxBtn onClick={this.onMaxClick} tabIndex="-1">
                MAX
              </MaxBtn>
              <TextInput
                placeholder="0.00"
                onChange={this.onInputChange}
                error={errors.mtnAmount}
                label="Amount (MET)"
                value={mtnAmount}
                id="mtnAmount"
              />
            </Sp>

            <Sp mt={3}>
              <Flex.Item grow="1" basis="0">
                <TextInput
                  onChange={this.onInputChange}
                  error={errors.password}
                  label="Password"
                  value={password}
                  type="password"
                  id="password"
                />
              </Flex.Item>
            </Sp>

            <Sp my={2}>
              <Flex.Row justify="space-between">
                <Flex.Item grow="1" basis="0">
                  {showGasFields && (
                    <TextInput
                      type="number"
                      onChange={this.onInputChange}
                      error={errors.gasLimit}
                      label="Gas Limt"
                      value={gasLimit}
                      id="gasLimit"
                    />
                  )}
                </Flex.Item>

                <Sp mt={6} mx={1} />

                <Flex.Item grow="1" basis="0">
                  <MaxBtn onClick={this.onGasClick} tabIndex="-1">
                    {showGasFields ? 'HIDE' : 'SHOW'} GAS
                  </MaxBtn>
                  {showGasFields && (
                    <TextInput
                      type="number"
                      onChange={this.onInputChange}
                      error={errors.gasPrice}
                      label="Gas Price"
                      value={gasPrice}
                      id="gasPrice"
                    />
                  )}
                </Flex.Item>
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
  availableMTN: selectors.getMtnBalanceWei(state),
  from: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(SendMTNForm)
