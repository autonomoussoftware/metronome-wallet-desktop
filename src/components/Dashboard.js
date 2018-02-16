import { DisplayValue, Btn, Sp } from './common'
import * as selectors from '../selectors'
import ReceiveDrawer from './ReceiveDrawer'
import { connect } from 'react-redux'
import SendDrawer from './SendDrawer'
import { toast } from 'react-toastify'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import TxList from './TxList'
import React from 'react'
const { clipboard } = window.require('electron')

const Container = styled.div`
  background-color: ${p => p.theme.colors.bg.primary};
  padding: 7.2rem 4.8rem;
  min-height: 100%;
  position: relative;
`

const FixedContainer = styled.div`
  background-color: ${p => p.theme.colors.bg.primary};
  position: fixed;
  padding: 0 4.8rem;
  left: 200px;
  z-index: 1;
  right: 0;
  top: 0;
`

const Header = styled.header`
  border-bottom: 1px solid ${p => p.theme.colors.darkShade};
  padding: 1.8rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Title = styled.h1`
  font-size: 2.4rem;
  line-height: 3rem;
  white-space: nowrap;
  margin: 0;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const AddressContainer = styled.div`
  display: flex;
  align-items: center;
`

const Label = styled.div`
  padding: 0.8rem;
  font-size: 1.3rem;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  letter-spacing: 0.5px;
  font-weight: 600;
`

const Bg = styled.div`
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 2px;
  background-color: ${p => p.theme.colors.lightShade};
`

const Address = styled.div`
  padding: 0 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: normal;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const CopyBtn = Btn.extend`
  border-radius: 0 2px 2px 0;
  line-height: 1.8rem;
  padding: 0.5rem 0.8rem;
  font-size: 1.4rem;
  letter-spacing: 1.4px;
  text-transform: uppercase;
`

const Hero = styled.div`
  margin-top: 4.8rem;
  display: flex;
`

const Left = styled.div`
  flex-grow: 1;
  background-color: ${p => p.theme.colors.lightShade};
  border-radius: 4px;
  padding: 0 2.4rem;
`

const Balance = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  & + & {
    border-top: 1px solid ${p => p.theme.colors.darkShade};
  }
`

const CoinSymbol = styled.div`
  border-radius: 14.1px;
  background-color: ${p => p.theme.colors.primary};
  width: 6.3rem;
  line-height: 3.2rem;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  position: relative;
  top: 3px;
`

const Value = styled.div`
  line-height: ${p => (p.large ? '6rem' : '4rem')};
  font-size: ${p => (p.large ? '4.8rem' : '3.2rem')};
  letter-spacing: ${p => (p.large ? '-1px' : 'inherit')};
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin: 2.4rem 3rem;
  flex-grow: 1;
`

const USDValue = styled.div`
  line-height: 3rem;
  font-size: 2.4rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  opacity: ${p => (p.hide ? '0' : '1')};
`

const Right = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 1.6rem;
  min-width: 18rem;
`

const NoTx = styled.div`
  font-size: 1.6rem;
  margin-top: 4.8rem;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

class Dashboard extends React.Component {
  static propTypes = {
    mtnBalanceWei: PropTypes.string.isRequired,
    mtnBalanceUSD: PropTypes.string.isRequired,
    ethBalanceWei: PropTypes.string.isRequired,
    ethBalanceUSD: PropTypes.string.isRequired,
    transactions: PropTypes.array.isRequired,
    address: PropTypes.string.isRequired
  }

  state = {
    activeModal: null
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  onCopyToClipboardClick = () => {
    clipboard.writeText(this.props.address)
    if (!toast.isActive(this.toastId)) {
      this.toastId = toast('Address copied to clipboard', {
        closeButton: false,
        autoClose: 2000
      })
    }
  }

  render() {
    const {
      mtnBalanceWei,
      mtnBalanceUSD,
      ethBalanceWei,
      ethBalanceUSD,
      transactions
    } = this.props

    return (
      <Container>
        <FixedContainer>
          <Header>
            <Title>My Wallet</Title>
            <AddressContainer>
              <Label>Address</Label>
              <Bg>
                <Address>{this.props.address}</Address>
                <CopyBtn onClick={this.onCopyToClipboardClick}>Copy</CopyBtn>
              </Bg>
            </AddressContainer>
          </Header>
        </FixedContainer>
        <Hero>
          <Left>
            <Balance>
              <CoinSymbol>MTN</CoinSymbol>
              <Value>
                <DisplayValue maxSize="4.8rem" value={mtnBalanceWei} />
              </Value>
              <USDValue hide>${mtnBalanceUSD} (USD)</USDValue>
            </Balance>
            <Balance>
              <CoinSymbol>ETH</CoinSymbol>
              <Value>
                <DisplayValue maxSize="3.2rem" value={ethBalanceWei} />
              </Value>
              <USDValue>${ethBalanceUSD} (USD)</USDValue>
            </Balance>
          </Left>

          <Right>
            <Btn block data-modal="send" onClick={this.onOpenModal}>
              Send
            </Btn>
            <Sp mt={2}>
              <Btn block data-modal="receive" onClick={this.onOpenModal}>
                Receive
              </Btn>
            </Sp>
          </Right>
        </Hero>

        {transactions && transactions.length > 0 ? (
          <TxList items={transactions} />
        ) : (
          <NoTx>No transactions to show yet.</NoTx>
        )}

        <ReceiveDrawer
          onRequestClose={this.onCloseModal}
          isOpen={this.state.activeModal === 'receive'}
        />
        <SendDrawer
          onRequestClose={this.onCloseModal}
          isOpen={this.state.activeModal === 'send'}
        />
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  mtnBalanceWei: selectors.getMtnBalanceWei(state),
  mtnBalanceUSD: selectors.getMtnBalanceUSD(state),
  ethBalanceWei: selectors.getEthBalanceWei(state),
  ethBalanceUSD: selectors.getEthBalanceUSD(state),
  transactions: selectors.getActiveWalletTransactions(state),
  address: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(Dashboard)
