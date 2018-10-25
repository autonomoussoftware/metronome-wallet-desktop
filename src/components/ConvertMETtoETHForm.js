import { DisplayValue, FieldBtn, TextInput, Flex, Btn, Sp } from './common'
import { sendToMainProcess, isWeiable } from '../utils'
import ConfirmationWizard from './ConfirmationWizard'
import ConverterEstimates from './ConverterEstimates'
import MinReturnCheckbox from './MinReturnCheckbox'
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
  line-height: 1.8rem;
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
    useMinimum: true,
    metAmount: null,
    estimate: null,
    errors: {},
    rate: null
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
      errors: {
        ...state.errors,
        [id]: null,
        useMinimum:
          id === 'estimate' && value !== null ? null : state.errors.useMinimum
      }
    }))

    // Estimate gas limit again if parameters changed
    if (['metAmount'].includes(id)) this.getGasEstimate()
  }

  onUseMinimumToggle = () =>
    this.setState(state => ({
      ...state,
      useMinimum: !state.useMinimum,
      errors: {
        ...state.errors,
        useMinimum: null
      }
    }))

  getGasEstimate = debounce(() => {
    const { metAmount } = this.state

    if (!isWeiable(metAmount)) return

    sendToMainProcess('metronome-convert-met-gas-limit', {
      value: Web3.utils.toWei(metAmount.replace(',', '.')),
      from: this.props.from
    })
      .then(({ gasLimit }) => this.setState({ gasLimit: gasLimit.toString() }))
      .catch(err => console.warn('Gas estimation failed', err)) // eslint-disable-line no-console
  }, 500)

  validate = () => {
    const { metAmount, gasPrice, gasLimit, estimate, useMinimum } = this.state
    const max = Web3.utils.fromWei(this.props.availableMTN)
    const errors = {
      ...validators.validateMetAmount(metAmount, max),
      ...validators.validateGasPrice(gasPrice, config.MAX_GAS_PRICE),
      ...validators.validateGasLimit(gasLimit),
      ...validators.validateUseMinimum(useMinimum, estimate)
    }
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) this.setState({ errors })
    return !hasErrors
  }

  onWizardSubmit = password => {
    return sendToMainProcess(
      'mtn-convert-mtn',
      {
        minReturn:
          this.state.useMinimum && typeof this.state.estimate === 'string'
            ? this.state.estimate
            : undefined,
        gasPrice: Web3.utils.toWei(
          this.state.gasPrice.replace(',', '.'),
          'gwei'
        ),
        gasLimit: this.state.gasLimit,
        password,
        value: Web3.utils.toWei(this.state.metAmount.replace(',', '.')),
        from: this.props.from
      },
      600000 // timeout to 10 minutes
    )
  }

  renderConfirmation = () => {
    const { metAmount, estimate, rate } = this.state
    return (
      <ConfirmationContainer data-testid="confirmation">
        You will convert{' '}
        <DisplayValue
          inline
          value={Web3.utils.toWei(metAmount.replace(',', '.'))}
          post=" MET"
        />{' '}
        and get approximately{' '}
        <DisplayValue value={estimate} post=" ETH" inline />
        {', which means a rate of '}
        <DisplayValue inline value={rate} post=" ETH/MET" />.
      </ConfirmationContainer>
    )
  }

  renderForm = goToReview => {
    return (
      <Flex.Column grow="1">
        {this.props.tabs}
        <Sp py={4} px={3}>
          <form
            data-testid="metToEth-form"
            noValidate
            onSubmit={goToReview}
            id="convertForm"
          >
            <div>
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
                rate={this.state.rate}
              />
              <MinReturnCheckbox
                useMinimum={this.state.useMinimum}
                onToggle={this.onUseMinimumToggle}
                label="Get expected ETH amount or cancel"
                error={this.state.errors.useMinimum}
              />
            </div>
          </form>
        </Sp>
        <Footer>
          <Btn submit block form="convertForm">
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
