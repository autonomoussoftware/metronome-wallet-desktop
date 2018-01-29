import ReceiveDrawer from './ReceiveDrawer';
import SendDrawer from './SendDrawer';
import ItemFilter from './ItemFilter';
import styled from 'styled-components';
import React from 'react';

const Container = styled.div`
  padding: 0 4.8rem;
`;

const Header = styled.header`
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
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
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
`;

const AddressContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.div`
  padding: 0.8rem;
  font-size: 1.3rem;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
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
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
`;

const CopyBtn = styled.button`
  font: inherit;
  background-image: linear-gradient(to top, #ededed, #ffffff);
  border-radius: 0 2px 2px 0;
  cursor: pointer;
  display: block;
  color: ${p => p.theme.colors.primary};
  line-height: 1.8rem;
  padding: 0.5rem 0.8rem;
  margin: 0;
  background: white;
  font-weight: 600;
  border: none;
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
    border-top: 1px solid rgba(0, 0, 0, 0.2);
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
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin: 2.4rem 3rem;
  flex-grow: 1;
`;

const USDValue = styled.div`
  line-height: 3rem;
  font-size: 2.4rem;
  font-weight: 600;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 1.6rem;
`;

const HeroBtn = styled.button`
  font: inherit;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  background-image: linear-gradient(to top, #ededed, #ffffff);
  box-shadow: inset 0 3px 0 0 rgba(255, 255, 255, 0.1);
  color: ${p => p.theme.colors.primary};
  line-height: 2.5rem;
  padding: 1.6rem;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  min-width: 18rem;
  & + & {
    margin-top: 1.6rem;
  }
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
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
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
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
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
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
`;

const Tx = styled.div`
  margin-left: 1.6rem;
  padding: 1.2rem 2.4rem 1.2rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  & + & {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
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
            <HeroBtn data-modal="send" onClick={this.onOpenModal}>
              Send
            </HeroBtn>
            <HeroBtn data-modal="receive" onClick={this.onOpenModal}>
              Receive
            </HeroBtn>
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
              <List>
                {filteredItems.map(tx => (
                  <Tx key={tx.id}>
                    <Icon />
                    <Amount>{tx.amount} MTN</Amount>
                  </Tx>
                ))}
              </List>
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
