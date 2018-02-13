import { sendToMainProcess, isWeiable, isGreaterThanZero } from '../utils'
import { BaseBtn, TextInput, Flex, Btn, Sp } from './common'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import config from '../config'
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
    password: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired
  }

  state = {
    mtnAmount: null,
    toAddress: null,
    password: null,
    status: 'init',
    errors: {},
    error: null
  }

  onMaxClick = () => {
    const mtnAmount = Web3.utils.fromWei(this.props.availableMTN)
    this.setState({ mtnAmount })
  }

  onInputChange = e => {
    const { id, value } = e.target
    this.setState({ [id]: value })
  }

  onSubmit = e => {
    e.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    const { toAddress, mtnAmount } = this.state

    this.setState({ status: 'pending', error: null, errors: {} }, () =>
      sendToMainProcess('send-token', {
        password: this.props.password,
        value: Web3.utils.toWei(mtnAmount.replace(',', '.')),
        token: config.MTN_TOKEN_ADDR,
        from: this.props.from,
        to: toAddress
      })
        .then(this.props.onSuccess)
        .catch(e =>
          this.setState({
            status: 'failure',
            error: e.message || 'Unknown error'
          })
        )
    )
  }

  // Perform validations and return an object of type { fieldId: [String] }
  validate = () => {
    const { toAddress, mtnAmount } = this.state
    const errors = {}

    // validations for address field
    if (!toAddress) {
      errors.toAddress = 'Address is required'
    } else if (!Web3.utils.isAddress(this.state.toAddress)) {
      errors.toAddress = 'Invalid address'
    }

    // validations for amount field
    if (!mtnAmount) {
      errors.mtnAmount = 'Amount is required'
    } else if (!isWeiable(mtnAmount)) {
      errors.mtnAmount = 'Invalid amount'
    } else if (!isGreaterThanZero(mtnAmount)) {
      errors.mtnAmount = 'Amount must be greater than 0'
    }

    return errors
  }

  render() {
    const { password, toAddress, mtnAmount, errors, status, error } = this.state

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
                label="Amount (MNT)"
                value={mtnAmount}
                error={errors.mtnAmount}
                id="mtnAmount"
              />
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
          <Btn block submit form="sendForm" disabled={status === 'pending'}>
            {status === 'pending' ? 'Sending...' : 'Send'}
          </Btn>
          {error && <ErrorMsg>{error}</ErrorMsg>}
        </Footer>
      </Flex.Column>
    )
  }
}

const mapStateToProps = state => ({
  availableMTN: selectors.getMtnBalanceWei(state),
  password: selectors.getPassword(state),
  from: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(SendMTNForm)
