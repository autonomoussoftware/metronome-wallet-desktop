import { DisplayValue, Drawer, Btn, Sp } from './common'
import ConfirmationWizard from './ConfirmationWizard'
import * as validators from '../validator'
import * as selectors from '../selectors'
import AmountFields from './AmountFields'
import { debounce } from 'lodash'
import { connect } from 'react-redux'
import * as utils from '../utils'
import GasEditor from './GasEditor'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Web3 from 'web3'

const WarningMsg = styled.div`
  margin-top: 1.6rem;
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${p => p.theme.colors.danger};
`

const ConfirmationContainer = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;

  & > div {
    color: ${p => p.theme.colors.primary};
  }
`

const ExpectedMsg = styled.div`
  font-size: 1.3rem;
  color: ${p => (p.error ? p.theme.colors.danger : 'inherit')};
`

const BtnContainer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  padding: 3.2rem 2.4rem;
`

class BuyMETDrawer extends React.Component {
  static propTypes = {
    tokenRemaining: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    currentPrice: PropTypes.string.isRequired,
    availableETH: PropTypes.string.isRequired,
    ETHprice: PropTypes.number.isRequired,
    isOpen: PropTypes.bool.isRequired,
    from: PropTypes.string.isRequired
  }

  static initialState = {
    calculatingMax: false,
    ...AmountFields.initialState,
    ...GasEditor.initialState('MET'),
    errors: {}
  }

  state = BuyMETDrawer.initialState

  componentWillReceiveProps(newProps) {
    if (newProps.isOpen && newProps.isOpen !== this.props.isOpen) {
      this.setState(BuyMETDrawer.initialState)
    }
  }

  onInputChange = e => {
    const { id, value } = e.target
    const { ETHprice } = this.props

    this.setState(state => ({
      ...state,
      ...AmountFields.onInputChange(state, ETHprice, id, value),
      errors: { ...state.errors, [id]: null },
      [id]: value
    }))

    // Estimate gas limit again if parameters changed
    if (['ethAmount'].includes(id)) this.updateGasLimit(value)
  }

  getGasEstimate = ethAmount => {
    if (!utils.isWeiable(ethAmount)) {
      return Promise.reject(new Error(`"${ethAmount}"" is an invalid value`))
    }
    return utils.sendToMainProcess('metronome-auction-gas-limit', {
      value: Web3.utils.toWei(ethAmount.replace(',', '.')),
      from: this.props.from
    })
  }

  updateGasLimit = debounce(ethAmount => {
    this.getGasEstimate(ethAmount)
      .then(({ gasLimit }) => {
        this.setState({ gasLimit: gasLimit.toString() })
        return { gasLimit }
      })
      .catch(err => console.warn('Gas estimation failed: ', err.message))
  }, 500)

  setMax = gasLimit => {
    const max = utils.calculateMaxAmount(
      this.props.availableETH,
      this.state.gasPrice,
      gasLimit
    )
    this.onInputChange({ target: { id: 'ethAmount', value: max } })
    this.setState({ calculatingMax: false })
  }

  onMaxClick = () => {
    this.setState({ calculatingMax: true })
    this.getGasEstimate(Web3.utils.fromWei(this.props.availableETH))
      .then(({ gasLimit }) => this.setMax(gasLimit))
      .catch(() => this.setMax(this.state.gasLimit))
  }

  onWizardSubmit = password => {
    return utils.sendToMainProcess('metronome-buy', {
      gasPrice: Web3.utils.toWei(this.state.gasPrice, 'gwei'),
      gasLimit: this.state.gasLimit,
      password,
      value: Web3.utils.toWei(this.state.ethAmount.replace(',', '.')),
      from: this.props.from
    })
  }

  validate = () => {
    const { ethAmount, gasPrice, gasLimit } = this.state
    const max = Web3.utils.fromWei(this.props.availableETH)
    const errors = {
      ...validators.validateEthAmount(ethAmount, max),
      ...validators.validateGasPrice(gasPrice),
      ...validators.validateGasLimit(gasLimit)
    }
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) this.setState({ errors })
    return !hasErrors
  }

  renderConfirmation = () => {
    const { currentPrice, tokenRemaining } = this.props
    const { ethAmount, usdAmount } = this.state

    const expected = utils.toMET(ethAmount, currentPrice, null, tokenRemaining)

    return (
      <ConfirmationContainer data-testid="confirmation">
        {expected.excedes ? (
          <React.Fragment>
            You will use{' '}
            <DisplayValue value={expected.usedETHAmount} post=" ETH" inline />{' '}
            to buy{' '}
            <DisplayValue
              inline
              value={this.props.tokenRemaining}
              post=" MET"
            />{' '}
            at current price and get a return of approximately{' '}
            <DisplayValue inline value={expected.excessETHAmount} post=" ETH" />.
            <Sp my={2}>
              <ExpectedMsg error>
                This operation will deplete the current auction.
              </ExpectedMsg>
            </Sp>
          </React.Fragment>
        ) : (
          <React.Fragment>
            You will use{' '}
            <DisplayValue
              value={Web3.utils.toWei(ethAmount)}
              post=" ETH"
              inline
            />{' '}
            (${usdAmount}) to buy approximately{' '}
            <DisplayValue
              inline
              value={expected.expectedMETamount}
              post=" MET"
            />{' '}
            at current price.
          </React.Fragment>
        )}
      </ConfirmationContainer>
    )
  }

  renderForm = goToReview => {
    const {
      useCustomGas,
      ethAmount,
      usdAmount,
      gasPrice,
      gasLimit,
      errors
    } = this.state

    const { expectedMETamount, excedes, excessETHAmount } = utils.toMET(
      ethAmount,
      this.props.currentPrice,
      null,
      this.props.tokenRemaining
    )

    const hasEnoughFunds = utils.hasEnoughFunds(
      this.props.availableETH,
      this.state.gasPrice,
      this.state.gasLimit,
      this.state.ethAmount
    )

    return (
      <form onSubmit={goToReview} noValidate data-testid="buy-form">
        <Sp py={4} px={3}>
          <AmountFields
            calculatingMax={this.state.calculatingMax}
            onMaxClick={this.onMaxClick}
            ethAmount={ethAmount}
            usdAmount={usdAmount}
            autoFocus
            onChange={this.onInputChange}
            errors={errors}
          />

          <Sp mt={3}>
            <GasEditor
              useCustomGas={useCustomGas}
              onChange={this.onInputChange}
              gasPrice={gasPrice}
              gasLimit={gasLimit}
              errors={errors}
            />
          </Sp>

          {expectedMETamount && (
            <Sp mt={2}>
              {excedes ? (
                <ExpectedMsg error>
                  You would get all remaining{' '}
                  <DisplayValue
                    inline
                    value={this.props.tokenRemaining}
                    post=" MET"
                  />{' '}
                  and receive a return of approximately{' '}
                  <DisplayValue inline value={excessETHAmount} post=" ETH" />.
                </ExpectedMsg>
              ) : (
                <ExpectedMsg>
                  You would get approximately{' '}
                  <DisplayValue inline value={expectedMETamount} post=" MET" />.
                </ExpectedMsg>
              )}
            </Sp>
          )}
          {!hasEnoughFunds && (
            <WarningMsg>
              You don&apos;t have enough ETH to cover the amount and gas cost
            </WarningMsg>
          )}
        </Sp>

        <BtnContainer>
          <Btn submit block disabled={!hasEnoughFunds}>
            Review Buy
          </Btn>
        </BtnContainer>
      </form>
    )
  }

  render() {
    const { onRequestClose, isOpen } = this.props

    return (
      <Drawer
        onRequestClose={onRequestClose}
        data-testid="buy-drawer"
        isOpen={isOpen}
        title="Buy Metronome"
      >
        <ConfirmationWizard
          renderConfirmation={this.renderConfirmation}
          onWizardSubmit={this.onWizardSubmit}
          pendingTitle="Buying MET..."
          renderForm={this.renderForm}
          editLabel="Edit this buy"
          validate={this.validate}
        />
      </Drawer>
    )
  }
}

const mapStateToProps = state => ({
  availableETH: selectors.getEthBalanceWei(state),
  ETHprice: selectors.getEthRate(state),
  from: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(BuyMETDrawer)
