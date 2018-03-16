import { DisplayValue, FieldBtn, TextInput, Flex, Btn, Sp } from './common'
import { sendToMainProcess, isWeiable } from '../utils'
import ConfirmationWizard from './ConfirmationWizard'
import ConverterEstimates from './ConverterEstimates'
import * as validators from '../validator'
import * as selectors from '../selectors'
import { debounce } from 'lodash'
import { connect } from 'react-redux'
import GasEditor from './GasEditor'
import PropTypes from 'prop-types'
import styled from 'styled-components'
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

class ConvertMETtoETHForm extends React.Component {
  static propTypes = {
    availableMTN: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired,
    tabs: PropTypes.node
  }

  state = {
    ...GasEditor.initialState('MET'),
    metAmount: null,
    estimate: null,
    errors: {}
  }

  onMaxClick = () => {
    const metAmount = Web3.utils.fromWei(this.props.availableMTN)
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
    if (['metAmount'].includes(id)) this.getGasEstimate()
  }

  getGasEstimate = debounce(() => {
    const { metAmount } = this.state

    if (!isWeiable(metAmount)) return

    sendToMainProcess('metronome-convert-met-gas-limit', {
      value: Web3.utils.toWei(metAmount.replace(',', '.')),
      from: this.props.from
    })
      .then(({ gasLimit }) => this.setState({ gasLimit: gasLimit.toString() }))
      .catch(err => console.warn('Gas estimation failed', err))
  }, 500)

  validate = () => {
    const { metAmount, gasPrice, gasLimit } = this.state
    const max = Web3.utils.fromWei(this.props.availableMTN)
    const errors = {
      ...validators.validateMetAmount(metAmount, max),
      ...validators.validateGasPrice(gasPrice),
      ...validators.validateGasLimit(gasLimit)
    }
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) this.setState({ errors })
    return !hasErrors
  }

  onWizardSubmit = password => {
    return sendToMainProcess(
      'mtn-convert-mtn',
      {
        gasPrice: Web3.utils.toWei(this.state.gasPrice, 'gwei'),
        gasLimit: this.state.gasLimit,
        password,
        value: Web3.utils.toWei(this.state.metAmount.replace(',', '.')),
        from: this.props.from
      },
      600000 // timeout to 10 minutes
    )
  }

  renderConfirmation = () => {
    const { metAmount, estimate } = this.state
    return (
      <ConfirmationContainer>
        You will convert{' '}
        <DisplayValue value={Web3.utils.toWei(metAmount)} post=" MET" inline />{' '}
        and get approximately{' '}
        <DisplayValue value={estimate} post=" ETH" inline />.
      </ConfirmationContainer>
    )
  }

  renderForm = goToReview => {
    return (
      <Flex.Column grow="1">
        {this.props.tabs}
        <Sp py={4} px={3}>
          <form onSubmit={goToReview} id="convertForm" noValidate>
            <div>
              <FieldBtn onClick={this.onMaxClick} tabIndex="-1" float>
                MAX
              </FieldBtn>
              <TextInput
                placeholder="0.00"
                autoFocus
                onChange={this.onInputChange}
                error={this.state.errors.metAmount}
                label="Amount (MET)"
                value={this.state.metAmount}
                id="metAmount"
              />
              <Sp mt={3}>
                <GasEditor
                  useCustomGas={this.state.useCustomGas}
                  onChange={this.onInputChange}
                  gasPrice={this.state.gasPrice}
                  gasLimit={this.state.gasLimit}
                  errors={this.state.errors}
                />
              </Sp>
              <ConverterEstimates
                convertTo="ETH"
                estimate={this.state.estimate}
                onChange={this.onInputChange}
                amount={this.state.metAmount}
              />
            </div>
          </form>
        </Sp>
        <Footer>
          <Btn block submit form="convertForm">
            Review Convert
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
        pendingTitle="Converting MET..."
        pendingText="This may take a while. You can close this and follow the status of the conversion in the transaction list."
        renderForm={this.renderForm}
        editLabel="Edit this conversion"
        validate={this.validate}
      />
    )
  }
}

const mapStateToProps = state => ({
  availableMTN: selectors.getMtnBalanceWei(state),
  from: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(ConvertMETtoETHForm)
