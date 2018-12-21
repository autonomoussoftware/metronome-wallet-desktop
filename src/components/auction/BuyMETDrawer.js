import withBuyMETFormState from 'metronome-wallet-ui-logic/src/hocs/withBuyMETFormState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import {
  ConfirmationWizard,
  DisplayValue,
  AmountFields,
  GasEditor,
  Drawer,
  Btn,
  Sp
} from '../common'

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
    expectedMETamount: PropTypes.string,
    gasEstimateError: PropTypes.bool,
    excessCoinAmount: PropTypes.string,
    onRequestClose: PropTypes.func.isRequired,
    coinPlaceholder: PropTypes.string,
    usdPlaceholder: PropTypes.string,
    tokenRemaining: PropTypes.string,
    onInputChange: PropTypes.func.isRequired,
    usedCoinAmount: PropTypes.string,
    useCustomGas: PropTypes.bool.isRequired,
    onMaxClick: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
    coinAmount: PropTypes.string,
    usdAmount: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    gasPrice: PropTypes.string,
    gasLimit: PropTypes.string,
    excedes: PropTypes.bool,
    errors: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen && prevProps.isOpen !== this.props.isOpen) {
      this.props.resetForm()
    }
  }

  renderConfirmation = () => (
    <ConfirmationContainer data-testid="confirmation">
      {this.props.excedes ? (
        <React.Fragment>
          You will use{' '}
          <DisplayValue value={this.props.usedCoinAmount} post=" ETH" inline />{' '}
          to buy{' '}
          <DisplayValue
            inline
            value={this.props.expectedMETamount}
            post=" MET"
          />{' '}
          at current price and get a return of approximately{' '}
          <DisplayValue
            inline
            value={this.props.excessCoinAmount}
            post=" ETH"
          />
          .
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
            inline
            value={this.props.coinAmount}
            toWei
            post=" ETH"
          />{' '}
          ($
          {this.props.usdAmount}) to buy approximately{' '}
          <DisplayValue
            inline
            value={this.props.expectedMETamount}
            post=" MET"
          />{' '}
          at current price.
        </React.Fragment>
      )}
    </ConfirmationContainer>
  )

  renderForm = goToReview => (
    <form onSubmit={goToReview} noValidate data-testid="buy-form">
      <Sp py={4} px={3}>
        <AmountFields
          coinPlaceholder={this.props.coinPlaceholder}
          usdPlaceholder={this.props.usdPlaceholder}
          onMaxClick={this.props.onMaxClick}
          coinAmount={this.props.coinAmount}
          usdAmount={this.props.usdAmount}
          autoFocus
          onChange={this.props.onInputChange}
          errors={this.props.errors}
        />

        <Sp mt={3}>
          <GasEditor
            gasEstimateError={this.props.gasEstimateError}
            onInputChange={this.props.onInputChange}
            useCustomGas={this.props.useCustomGas}
            gasLimit={this.props.gasLimit}
            gasPrice={this.props.gasPrice}
            errors={this.props.errors}
          />
        </Sp>

        {this.props.expectedMETamount && (
          <Sp mt={2}>
            {this.props.excedes ? (
              <ExpectedMsg error>
                You would get all remaining{' '}
                <DisplayValue
                  inline
                  value={this.props.tokenRemaining}
                  post=" MET"
                />{' '}
                and receive a return of approximately{' '}
                <DisplayValue
                  inline
                  value={this.props.excessCoinAmount}
                  post=" ETH"
                />
                .
              </ExpectedMsg>
            ) : (
              <ExpectedMsg>
                You would get approximately{' '}
                <DisplayValue
                  inline
                  value={this.props.expectedMETamount}
                  post=" MET"
                />
                .
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

  render() {
    return (
      <Drawer
        onRequestClose={this.props.onRequestClose}
        data-testid="buy-drawer"
        isOpen={this.props.isOpen}
        title="Buy Metronome"
      >
        <ConfirmationWizard
          renderConfirmation={this.renderConfirmation}
          onWizardSubmit={this.props.onSubmit}
          pendingTitle="Buying MET..."
          renderForm={this.renderForm}
          editLabel="Edit this buy"
          validate={this.props.validate}
        />
      </Drawer>
    )
  }
}

export default withBuyMETFormState(BuyMETDrawer)
