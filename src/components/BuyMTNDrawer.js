import { validateEthAmount, validatePassword } from '../validator'
import PurchaseFormProvider from './providers/PurchaseFormProvider'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import * as utils from '../utils'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import theme from '../theme'
import React from 'react'
import Web3 from 'web3'
import {
  TextInput,
  CheckIcon,
  BaseBtn,
  Drawer,
  TxIcon,
  Flex,
  Btn,
  Sp
} from './common'

const Title = styled.div`
  line-height: 3rem;
  font-size: 2.4rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const Message = styled.div`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

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

const ExpectedMsg = styled.div`
  font-size: 1.3rem;
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

class BuyMTNDrawer extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    currentPrice: PropTypes.string.isRequired,
    availableETH: PropTypes.string.isRequired,
    ETHprice: PropTypes.number.isRequired,
    isOpen: PropTypes.bool.isRequired,
    from: PropTypes.string.isRequired
  }

  static initialState = {
    transactionHash: null,
    ethAmount: null,
    usdAmount: null,
    password: null,
    errors: {},
    status: 'init',
    error: null
  }

  state = BuyMTNDrawer.initialState

  onMaxClick = () => {
    const ethAmount = Web3.utils.fromWei(this.props.availableETH)
    this.setState({
      usdAmount: utils.toUSD(ethAmount, this.props.ETHprice),
      ethAmount
    })
  }

  componentWillReceiveProps(newProps) {
    if (newProps.isOpen && newProps.isOpen !== this.props.isOpen) {
      this.setState(BuyMTNDrawer.initialState)
    }
  }

  onInputChange = e => {
    const { id, value } = e.target
    const { ETHprice } = this.props

    this.setState(state => ({
      ...state,
      usdAmount:
        id === 'ethAmount' ? utils.toUSD(value, ETHprice) : state.usdAmount,
      ethAmount:
        id === 'usdAmount' ? utils.toETH(value, ETHprice) : state.ethAmount,
      errors: { ...state.errors, [id]: null },
      [id]: value
    }))
  }

  onSubmit = ev => {
    ev.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    const { ethAmount, password } = this.state

    this.setState({ status: 'pending', error: null, errors: {} }, () =>
      utils
        .sendToMainProcess('mtn-buy', {
          password,
          value: Web3.utils.toWei(ethAmount.replace(',', '.')),
          from: this.props.from
        })
        .then(({ hash: transactionHash }) => {
          this.setState({ status: 'success', transactionHash })
        })
        .catch(err =>
          this.setState({
            status: 'failure',
            error: err.message || 'Unknown error'
          })
        )
    )
  }

  validate = () => {
    const { ethAmount, password } = this.state
    const max = Web3.utils.fromWei(this.props.availableETH)

    return {
      ...validateEthAmount(ethAmount, max),
      ...validatePassword(password)
    }
  }

  render() {
    const { onRequestClose, isOpen, currentPrice } = this.props
    const {
      ethAmount,
      usdAmount,
      password,
      status: buyStatus,
      errors,
      error
    } = this.state

    return (
      <Drawer
        onRequestClose={onRequestClose}
        isOpen={isOpen}
        title="Buy Metronome"
      >
        {buyStatus !== 'success' && (
          <PurchaseFormProvider
            disclaimerAccepted
            currentPrice={currentPrice}
            amount={ethAmount}
          >
            {({ expectedMTNamount, isValidPurchase }) => (
              <form onSubmit={this.onSubmit}>
                <Sp py={4} px={3}>
                  <Flex.Row justify="space-between">
                    <Flex.Item grow="1" basis="0">
                      <MaxBtn onClick={this.onMaxClick} tabIndex="-1">
                        MAX
                      </MaxBtn>
                      <TextInput
                        placeholder="0.00"
                        autoFocus
                        onChange={this.onInputChange}
                        disabled={buyStatus !== 'init'}
                        error={errors.ethAmount}
                        label="Amount (ETH)"
                        value={ethAmount}
                        id="ethAmount"
                      />
                    </Flex.Item>
                    <Sp mt={6} mx={1}>
                      <TxIcon />
                    </Sp>
                    <Flex.Item grow="1" basis="0">
                      <TextInput
                        placeholder="0.00"
                        onChange={this.onInputChange}
                        disabled={buyStatus !== 'init'}
                        error={errors.usdAmount}
                        label="Amount (USD)"
                        value={usdAmount}
                        id="usdAmount"
                      />
                    </Flex.Item>
                  </Flex.Row>

                  <Flex.Row justify="space-between">
                    <Flex.Item grow="1" basis="0">
                      <Sp my={2}>
                        <TextInput
                          type="password"
                          onChange={this.onInputChange}
                          disabled={buyStatus !== 'init'}
                          error={errors.password}
                          label="Password"
                          value={password}
                          id="password"
                        />
                      </Sp>
                    </Flex.Item>
                  </Flex.Row>

                  {expectedMTNamount && (
                    <Sp mt={2}>
                      <ExpectedMsg>
                        You would get
                        <br />
                        {expectedMTNamount} MET
                      </ExpectedMsg>
                    </Sp>
                  )}

                  {error && <ErrorMsg>{error}</ErrorMsg>}
                </Sp>

                <BtnContainer>
                  <Btn
                    disabled={!isValidPurchase || buyStatus === 'pending'}
                    submit
                    block
                  >
                    {buyStatus === 'pending' ? 'Buying...' : 'Buy'}
                  </Btn>
                </BtnContainer>
              </form>
            )}
          </PurchaseFormProvider>
        )}
        {buyStatus === 'success' && (
          <Sp my={19} mx={12}>
            <Flex.Column align="center">
              <CheckIcon color={theme.colors.success} />
              <Sp my={2}>
                <Title>Success!</Title>
              </Sp>
              <Message>
                You can view the status of this transaction in the transaction
                list.
              </Message>
            </Flex.Column>
          </Sp>
        )}
      </Drawer>
    )
  }
}

const mapStateToProps = state => ({
  availableETH: selectors.getEthBalanceWei(state),
  ETHprice: selectors.getEthRate(state),
  from: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(BuyMTNDrawer)
