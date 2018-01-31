import { ItemFilter, Fade, Btn } from '../common';
import { TransitionGroup } from 'react-transition-group';
import ReceiveDrawer from './ReceiveDrawer';
import SendDrawer from './SendDrawer';
import styled from 'styled-components';
import React from 'react';

const Container = styled.div`
  background-color: ${p => p.theme.colors.bg.primary};
  padding: 0 4.8rem;
  min-height: 100%;
`;

const Header = styled.header`
  border-bottom: 1px solid ${p => p.theme.colors.shade};
  padding: 1.8rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: 2.4rem;
  line-height: 3rem;
  white-space: nowrap;
  margin: 0;
  text-shadow: 0 1px 1px ${p => p.theme.colors.shade};
`;

const AddressContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.div`
  padding: 0.8rem;
  font-size: 1.3rem;
  text-shadow: 0 1px 1px ${p => p.theme.colors.shade};
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const Bg = styled.div`
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 2px;
  background-color: rgba(0, 0, 0, 0.1);
`;

const Address = styled.div`
  padding: 0 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: normal;
  text-shadow: 0 1px 1px ${p => p.theme.colors.shade};
`;

const CopyBtn = Btn.extend`
  border-radius: 0 2px 2px 0;
  line-height: 1.8rem;
  padding: 0.5rem 0.8rem;
  font-size: 1.4rem;
  letter-spacing: 1.4px;
  text-transform: uppercase;
`;

const Hero = styled.div`
  margin-top: 4.8rem;
  display: flex;
`;

const Left = styled.div`
  flex-grow: 1;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 0 2.4rem;
`;

const Balance = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  & + & {
    border-top: 1px solid ${p => p.theme.colors.shade};
  }
`;

const CoinSymbol = styled.div`
  border-radius: 14.1px;
  background-color: ${p => p.theme.colors.primary};
  width: 6.3rem;
  line-height: 3.2rem;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
`;

const Value = styled.div`
  line-height: ${p => (p.large ? '6rem' : '4rem')};
  font-size: ${p => (p.large ? '4.8rem' : '3.2rem')};
  letter-spacing: ${p => (p.large ? '-1px' : 'inherit')};
  text-shadow: 0 1px 1px ${p => p.theme.colors.shade};
  margin: 2.4rem 3rem;
  flex-grow: 1;
`;

const USDValue = styled.div`
  line-height: 3rem;
  font-size: 2.4rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.shade};
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 1.6rem;
  min-width: 18rem;
`;

const Transactions = styled.div`
  margin-top: 4.8rem;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: baseline;
`;

const ListTitle = styled.div`
  flex-grow: 1;
  line-height: 2.5rem;
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.shade};
`;

const TabsContainer = styled.div`
  display: flex;
`;

const Tab = styled.button`
  font: inherit;
  line-height: 1.8rem;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.shade};
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
`;

const List = styled.div`
  border-radius: 2px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 ${p => p.theme.colors.shade};
`;

const Tx = styled.div`
  margin-left: 1.6rem;
  padding: 1.2rem 2.4rem 1.2rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: ${({ i }) => (i > 0 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none')};
`;

const Icon = styled.div`
  display: block;
  width: 2.4rem;
  height: 2.4rem;
  background-color: silver;
`;

const Amount = styled.div`
  line-height: 2.5rem;
  font-size: 2rem;
  color: ${p => p.theme.colors.primary};
`;

const transactions = [
  {
    id: 0,
    type: 'auction',
    amount: 0.0000201
  },
  {
    id: 1,
    type: 'sent',
    amount: 11.1231201
  },
  {
    id: 2,
    type: 'received',
    amount: 9.1200000001
  },
  {
    id: 3,
    type: 'auction',
    amount: 0.000072
  },
  {
    id: 4,
    type: 'exchanged',
    amount: 0.112300000201
  }
];

export default class Wallets extends React.Component {
  state = {
    activeModal: null
  };

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal });

  onCloseModal = () => this.setState({ activeModal: null });

  render() {
    return (
      <Container>
        <Header>
          <Title>My Wallet 1</Title>
          <AddressContainer>
            <Label>Address</Label>
            <Bg>
              <Address>0x29384775fn4747fhfu8484hfhhf848hhf8292939jj9</Address>
              <CopyBtn>Copy</CopyBtn>
            </Bg>
          </AddressContainer>
        </Header>
        <Hero>
          <Left>
            <Balance>
              <CoinSymbol>MTN</CoinSymbol>
              <Value large>2345678.56789</Value>
              <USDValue>$4567890 (USD)</USDValue>
            </Balance>
            <Balance>
              <CoinSymbol>ETH</CoinSymbol>
              <Value>2345678.56789</Value>
              <USDValue>$4567890 (USD)</USDValue>
            </Balance>
          </Left>
          <Right>
            <Btn block data-modal="send" onClick={this.onOpenModal}>
              Send
            </Btn>
            <Btn mt={2} block data-modal="receive" onClick={this.onOpenModal}>
              Receive
            </Btn>
          </Right>
        </Hero>
        <ItemFilter extractValue={tx => tx.type} items={transactions}>
          {({ filteredItems, onFilterChange, activeFilter }) => (
            <Transactions>
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
                    isActive={activeFilter === 'exchanged'}
                    onClick={() => onFilterChange('exchanged')}
                  >
                    Exchanged
                  </Tab>
                </TabsContainer>
              </ListHeader>

              <TransitionGroup component={List}>
                {filteredItems.map((tx, i) => (
                  <Fade key={tx.id} maxHeight="5rem">
                    <Tx i={i}>
                      <Icon />
                      <Amount>{tx.amount} MTN</Amount>
                    </Tx>
                  </Fade>
                ))}
              </TransitionGroup>
            </Transactions>
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
    );
  }
}
