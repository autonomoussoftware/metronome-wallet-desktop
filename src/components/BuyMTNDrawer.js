import PurchaseFormProvider from '../providers/PurchaseFormProvider'
import { Drawer, Btn, Sp } from '../common'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Label = styled.label`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const Input = styled.input`
  border: none;
  display: block;
  height: 5.6rem;
  padding: 0.8rem 1.6rem;
  background-color: rgba(126, 97, 248, 0.2);
  margin-top: 0.8rem;
  width: 100%;
  line-height: 4rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
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

export default class BuyMTNDrawer extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    currentPrice: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  static initialState = {
    disclaimerAccepted: true,
    receipt: null,
    status: 'init',
    error: null,
    input: null
  }

  state = BuyMTNDrawer.initialState

  componentWillReceiveProps(newProps) {
    if (newProps.isOpen !== this.props.isOpen) {
      this.setState(BuyMTNDrawer.initialState)
    }
  }

  onInputChanged = e => this.setState({ input: e.target.value })

  onSubmit = e => {
    e.preventDefault()

    this.setState({ status: 'pending' })

    // auction
    //   .buy(this.state.input)
    //   .then(receipt => this.setState({ status: 'success', receipt }))
    //   .catch(e => this.setState({ status: 'failure', error: e.message }))
  }

  render() {
    const { disclaimerAccepted, receipt, status, error, input } = this.state
    const { onRequestClose, isOpen, currentPrice } = this.props

    return (
      <Drawer
        onRequestClose={onRequestClose}
        isOpen={isOpen}
        title="Buy Metronome"
      >
        <PurchaseFormProvider
          disclaimerAccepted={disclaimerAccepted}
          currentPrice={currentPrice}
          amount={input}
        >
          {({
            expectedMTNamount,
            isValidPurchase,
            isValidAmount,
            isPristine
          }) => (
            <form onSubmit={this.onSubmit}>
              <Sp py={4} px={3}>
                <div>
                  <Label>ETH amount</Label>
                  <Input
                    placeholder="Enter a valid amount"
                    onChange={this.onInputChanged}
                    disabled={status !== 'init'}
                    value={input === null ? '' : input}
                  />
                </div>
                {expectedMTNamount && (
                  <div>
                    <p>You would get</p>
                    <p>{expectedMTNamount} MTN</p>
                  </div>
                )}
                {!isValidAmount &&
                  !isPristine && <ErrorMsg>Invalid ETH amount</ErrorMsg>}
                {status === 'success' && (
                  <div>
                    <p>Your receipt:</p>
                    <pre>{JSON.stringify(receipt, null, 2)}</pre>
                  </div>
                )}
                {status === 'pending' && (
                  <div>
                    <p>Waiting for receipt...</p>
                  </div>
                )}
                {status === 'failure' && <ErrorMsg>{error}</ErrorMsg>}
              </Sp>
              {status === 'init' && (
                <BtnContainer>
                  <Btn block submit disabled={!isValidPurchase}>
                    Buy
                  </Btn>
                </BtnContainer>
              )}
            </form>
          )}
        </PurchaseFormProvider>
      </Drawer>
    )
  }
}
