import React from 'react'
import styled from 'styled-components'
import { TransitionGroup } from 'react-transition-group'

import TxRow from './TxRow'
import SendDrawer from './SendDrawer'
import ReceiveDrawer from './ReceiveDrawer'
import { ItemFilter, LogoIcon, Btn, Sp } from '../common'
import wallet from '../../services/wallet'
import transactions from '../../services/tx-mock'
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
`

const Right = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 1.6rem;
  min-width: 18rem;
`

const ListHeader = styled.div`
  display: flex;
  align-items: baseline;
  position: sticky;
  background: ${p => p.theme.colors.bg.primary};
  top: 7.2rem;
  left: 0;
  right: 0;
  z-index: 1;
  margin: 0 -4.8rem;
  padding: 0 4.8rem;
`

const ListTitle = styled.div`
  flex-grow: 1;
  line-height: 2.5rem;
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const TabsContainer = styled.div`
  display: flex;
`

const Tab = styled.button`
  font: inherit;
  line-height: 1.8rem;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  opacity: ${p => (p.isActive ? '1' : '0.5')};
  text-transform: uppercase;
  padding: 1.6rem;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  border-bottom: 2px solid ${p => (p.isActive ? 'white' : 'transparent')};
  margin-bottom: 1px;
  transition: 0.3s;
  &:focus {
    outline: none;
  }
`

const List = styled.div`
  border-radius: 2px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 ${p => p.theme.colors.darkShade};
`

const FooterLogo = styled.div`
  padding: 4.8rem;
  width: 3.2rem;
  margin: 0 auto;
`

export default class Wallets extends React.Component {
  state = {
    activeModal: null,
    address: wallet.getAddress(),
    balance: null
  }

  componentDidMount() {
    wallet.getBalance().then(balance => {
      this.setState({ balance })
    })
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  onCopyToClipboardClick = () => clipboard.writeText(this.state.address)

  render() {
    return (
      <Container>
        <FixedContainer>
          <Header>
            <Title>My Wallet 1</Title>
            <AddressContainer>
              <Label>Address</Label>
              <Bg>
                <Address>{this.state.address}</Address>
                <CopyBtn onClick={this.onCopyToClipboardClick}>Copy</CopyBtn>
              </Bg>
            </AddressContainer>
          </Header>
        </FixedContainer>
        <Hero>
          {this.state.balance && (
            <Left>
              <Balance>
                <CoinSymbol>MTN</CoinSymbol>
                <Value large>{this.state.balance.mtn}</Value>
                <USDValue>$4567890 (USD)</USDValue>
              </Balance>
              <Balance>
                <CoinSymbol>ETH</CoinSymbol>
                <Value>{this.state.balance.eth}</Value>
                <USDValue>$4567890 (USD)</USDValue>
              </Balance>
            </Left>
          )}
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
        <ItemFilter extractValue={tx => tx.type} items={transactions}>
          {({ filteredItems, onFilterChange, activeFilter }) => (
            <Sp mt={6}>
              <ListHeader>
                <ListTitle>Transactions</ListTitle>
                <TabsContainer>
                  <Tab
                    isActive={activeFilter === ''}
                    onClick={() => onFilterChange('')}
                  >
                    All
                  </Tab>
                  <Tab
                    isActive={activeFilter === 'sent'}
                    onClick={() => onFilterChange('sent')}
                  >
                    Sent
                  </Tab>
                  <Tab
                    isActive={activeFilter === 'received'}
                    onClick={() => onFilterChange('received')}
                  >
                    Received
                  </Tab>
                  <Tab
                    isActive={activeFilter === 'auction'}
                    onClick={() => onFilterChange('auction')}
                  >
                    Auction
                  </Tab>
                  <Tab
                    isActive={activeFilter === 'converted'}
                    onClick={() => onFilterChange('converted')}
                  >
                    Converted
                  </Tab>
                </TabsContainer>
              </ListHeader>

              <List>
                <TransitionGroup>
                  {filteredItems.map(tx => <TxRow key={tx.id} {...tx} />)}
                </TransitionGroup>
                <FooterLogo>
                  <LogoIcon />
                </FooterLogo>
              </List>
            </Sp>
          )}
        </ItemFilter>
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
