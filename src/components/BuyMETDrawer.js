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
    if (['ethAmount'].includes(id)) this.getGasEstimate()
  }

  getGasEstimate = debounce(() => {
    const { ethAmount } = this.state

    if (!utils.isWeiable(ethAmount)) return

    utils
      .sendToMainProcess('metronome-auction-gas-limit', {
        value: Web3.utils.toWei(ethAmount.replace(',', '.')),
        from: this.props.from
      })
      .then(({ gasLimit }) => this.setState({ gasLimit: gasLimit.toString() }))
      .catch(err => console.warn('Gas estimation failed', err))
  }, 500)

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
      <ConfirmationContainer>
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
            <p>
              <ExpectedMsg error>
                This operation will deplete the current auction.
              </ExpectedMsg>
            </p>
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

    return (
      <form onSubmit={goToReview} noValidate>
        <Sp py={4} px={3}>
          <AmountFields
            availableETH={this.props.availableETH}
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
        </Sp>

        <BtnContainer>
          <Btn submit block>
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
