import { DisplayValue, FieldBtn, TextInput, Flex, Btn, Sp } from './common'
import { sendToMainProcess, isWeiable } from '../utils'
import ConfirmationWizard from './ConfirmationWizard'
import * as validators from '../validator'
import * as selectors from '../selectors'
import { debounce } from 'lodash'
import { connect } from 'react-redux'
import GasEditor from './GasEditor'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import config from '../config'
import React from 'react'
import Web3 from 'web3'

const ConfirmationContainer = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;

  & > div {
    color: ${p => p.theme.colors.primary};
  }
`

const Footer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  padding: 3.2rem 2.4rem;
  flex-grow: 1;
  height: 100%;
`

class SendMETForm extends React.Component {
  static propTypes = {
    availableMET: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired,
    tabs: PropTypes.node
  }

  state = {
    ...GasEditor.initialState('MET'),
    toAddress: null,
    metAmount: null,
    errors: {}
  }

  onMaxClick = () => {
    const metAmount = Web3.utils.fromWei(this.props.availableMET)
    this.setState({ metAmount })
  }

  onInputChange = e => {
    const { id, value } = e.target

    this.setState(state => ({
      ...state,
      [id]: value,
      errors: { ...state.errors, [id]: null }
    }))

    // Estimate gas limit again if parameters changed
    if (['toAddress', 'metAmount'].includes(id)) this.getGasEstimate()
  }

  getGasEstimate = debounce(() => {
    const { metAmount, toAddress } = this.state

    if (!isWeiable(metAmount) || !Web3.utils.isAddress(toAddress)) return

    sendToMainProcess('tokens-get-gas-limit', {
      value: Web3.utils.toWei(metAmount.replace(',', '.')),
      token: config.MTN_TOKEN_ADDR,
      from: this.props.from,
      to: toAddress
    })
      .then(({ gasLimit }) => this.setState({ gasLimit: gasLimit.toString() }))
      .catch(err => console.warn('Gas estimation failed', err)) // eslint-disable-line no-console
  }, 500)

  validate = () => {
    const { toAddress, metAmount, gasLimit, gasPrice } = this.state
    const max = Web3.utils.fromWei(this.props.availableMET)
    const errors = {
      ...validators.validateToAddress(toAddress),
      ...validators.validateMetAmount(metAmount, max),
      ...validators.validateGasPrice(gasPrice, config.MAX_GAS_PRICE),
      ...validators.validateGasLimit(gasLimit)
    }
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) this.setState({ errors })
    return !hasErrors
  }

  renderConfirmation = () => {
    const { metAmount, toAddress } = this.state
    return (
      <ConfirmationContainer data-testid="confirmation">
        You will send{' '}
        <DisplayValue value={Web3.utils.toWei(metAmount)} post=" MET" inline />{' '}
        to the address {toAddress}.
      </ConfirmationContainer>
    )
  }

  onWizardSubmit = password => {
    return sendToMainProcess('send-token', {
      gasPrice: Web3.utils.toWei(this.state.gasPrice, 'gwei'),
      gasLimit: this.state.gasLimit,
      password,
      token: config.MTN_TOKEN_ADDR,
      value: Web3.utils.toWei(this.state.metAmount.replace(',', '.')),
      from: this.props.from,
      to: this.state.toAddress
    })
  }

  renderForm = goToReview => {
    return (
      <Flex.Column grow="1">
        {this.props.tabs}
        <Sp py={4} px={3}>
          <form
            data-testid="sendMet-form"
            noValidate
            onSubmit={goToReview}
            id="sendForm"
          >
            <TextInput
              placeholder="e.g. 0x2345678998765434567"
              data-testid="toAddress-field"
              autoFocus
              onChange={this.onInputChange}
              error={this.state.errors.toAddress}
              label="Send to Address"
              value={this.state.toAddress}
              id="toAddress"
            />
            <Sp mt={3}>
              <FieldBtn
                data-testid="max-btn"
                tabIndex="-1"
                onClick={this.onMaxClick}
                float
              >
                MAX
              </FieldBtn>
              <TextInput
                placeholder="0.00"
                data-testid="metAmount-field"
                onChange={this.onInputChange}
                error={this.state.errors.metAmount}
                label="Amount (MET)"
                value={this.state.metAmount}
                id="metAmount"
              />
            </Sp>

            <Sp mt={3}>
              <GasEditor
                useCustomGas={this.state.useCustomGas}
                onChange={this.onInputChange}
                gasPrice={this.state.gasPrice}
                gasLimit={this.state.gasLimit}
                errors={this.state.errors}
              />
            </Sp>
          </form>
        </Sp>
        <Footer>
          <Btn block submit form="sendForm">
            Review Send
          </Btn>
        </Footer>
      </Flex.Column>
    )
  }

  render() {
    return (
      <ConfirmationWizard
        renderConfirmation={this.renderConfirmation}
        onWizardSubmit={this.onWizardSubmit}
        renderForm={this.renderForm}
        validate={this.validate}
      />
    )
  }
}

const mapStateToProps = state => ({
  availableMET: selectors.getMtnBalanceWei(state),
  from: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(SendMETForm)
