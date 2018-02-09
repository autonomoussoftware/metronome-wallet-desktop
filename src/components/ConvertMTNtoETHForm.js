import { sendToMainProcess, isWeiable, isGreaterThanZero } from '../utils'
import { BaseBtn, TextInput, Btn, Sp } from './common'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
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

const ErrorMsg = styled.p`
  color: red;
`

const BtnContainer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  height: 100%;
  padding: 6.4rem 2.4rem;
  flex-grow: 1;
`

class ConvertMTNtoETHForm extends React.Component {
  static propTypes = {
    availableMTN: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired
  }

  state = {
    mtnAmount: null,
    status: 'init',
    errors: {}
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

    const { mtnAmount } = this.state

    this.setState({ status: 'pending', error: null, errors: {} }, () =>
      sendToMainProcess('mtn-convert-eth', {
        password: this.props.password,
        value: Web3.utils.toWei(mtnAmount.replace(',', '.')),
        from: this.props.from
      })
        .then(console.log)
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
    const { mtnAmount } = this.state
    const errors = {}

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
    const { mtnAmount, status, errors, error } = this.state

    return (
      <form onSubmit={this.onSubmit}>
        <Sp py={4} px={3}>
          <MaxBtn onClick={this.onMaxClick}>MAX</MaxBtn>
          <TextInput
            placeholder="0.00"
            onChange={this.onInputChange}
            label="Amount (MNT)"
            value={mtnAmount}
            error={errors.mtnAmount}
            id="mtnAmount"
          />
        </Sp>
        {status === 'failure' && <ErrorMsg>{error}</ErrorMsg>}
        <BtnContainer>
          <Btn disabled={status === 'pending'} submit block>
            {status === 'pending' ? 'Converting...' : 'Convert'}
          </Btn>
        </BtnContainer>
      </form>
    )
  }
}

const mapStateToProps = state => ({
  availableMTN: selectors.getMtnBalanceWei(state),
  password: selectors.getPassword(state),
  from: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(ConvertMTNtoETHForm)
