import Web3 from 'web3'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as selectors from '../selectors'
import { sendToMainProcess } from '../utils'
import { BaseBtn, TextInput, Flex, Btn, Sp } from './common'
import { validateMtnAmount, validatePassword } from '../validator'

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
    errors: {},
    error: null
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
      errors: { ...state.errors, [id]: null },
    }))
  }

  onSubmit = e => {
    e.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    const { password, mtnAmount } = this.state

    this.setState({ status: 'pending', error: null, errors: {} }, () =>
      sendToMainProcess('mtn-convert-eth', {
        password,
        value: Web3.utils.toWei(mtnAmount.replace(',', '.')),
        from: this.props.from
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

  validate = () => {
    const { password, mtnAmount } = this.state

    return {
      ...validateMtnAmount(mtnAmount),
      ...validatePassword(password)
    }
  }

  render() {
    const { password, mtnAmount, status, errors, error } = this.state

    return (
      <Flex.Column grow="1">
        <Sp pt={4} pb={3} px={3}>
          <form onSubmit={this.onSubmit} id="convertForm">
            <div>
              <MaxBtn onClick={this.onMaxClick} tabIndex="-1">
                MAX
              </MaxBtn>
              <TextInput
                placeholder="0.00"
                autoFocus
                onChange={this.onInputChange}
                label="Amount (MNT)"
                value={mtnAmount}
                error={errors.mtnAmount}
                id="mtnAmount"
              />
              <Sp my={3}>
                <TextInput
                  type="password"
                  onChange={this.onInputChange}
                  label="Password"
                  value={password}
                  error={errors.password}
                  disabled={status !== 'init'}
                  id="password"
                />
              </Sp>
            </div>
          </form>
        </Sp>
        <Footer>
          <Btn block submit form="convertForm" disabled={status === 'pending'}>
            {status === 'pending' ? 'Converting...' : 'Convert'}
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
