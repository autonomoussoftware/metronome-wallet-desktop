import { DarkLayout, Btn } from '../common';
import MTNAuctionProvider from '../providers/MTNAuctionProvider';
import CountDownProvider from '../providers/CountDownProvider';
import BuyMTNDrawer from './BuyMTNDrawer';
import PropTypes from 'prop-types';
import settings from '../../config/settings';
import styled from 'styled-components';
import Wallet from './MTNWallet';
import React from 'react';
import Web3 from 'web3';

const Body = styled.div`
  padding: 3.2rem 4.8rem;
`;

const CountDownTitle = styled.div`
  line-height: 2.5rem;
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.shade};
`;

const Row = styled.div`
  margin-top: 1.6rem;
  display: flex;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
`;

const Cell = styled.div`
  opacity: ${({ isFaded }) => (isFaded ? '0.5' : '1')};
  padding: 1.6rem;
  flex-grow: 1;
  flex-basis: 0;
  color: ${p => p.theme.colors.primary};
  line-height: 6rem;
  letter-spacing: -1px;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.shade};
  border-left: 1px solid ${p => p.theme.colors.shade};
  font-size: 2.4rem;
  &:first-child {
    border-left: none;
  }
  @media (min-width: 960px) {
    font-size: 3.2rem;
  }
  @media (min-width: 1280px) {
    padding: 3rem;
    font-size: 4.8rem;
  }
`;

const CurrentPrice = styled.div`
  padding: 3.5rem 2.4rem;
  margin-top: 1.6rem;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  line-height: 4rem;
  font-size: 3.2rem;
  text-shadow: 0 1px 1px ${p => p.theme.colors.shade};
`;

const BuyBtn = Btn.extend`
  margin-top: 2.4rem;
`;

export default class Auction extends React.Component {
  static propTypes = {
    seed: PropTypes.string.isRequired
  };

  state = {
    activeModal: null
  };

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal });

  onCloseModal = () => this.setState({ activeModal: null });

  render() {
    return (
      <DarkLayout title="Metronome Auction">
        <MTNAuctionProvider
          statusTopic={settings.WS_AUCTION_STATUS_TOPIC}
          apiUrl={settings.MTN_API_URL}
        >
          {({ status }) =>
            status && (
              <Body>
                <div>
                  <CountDownTitle>Time Remaining</CountDownTitle>
                  <CountDownProvider
                    targetTimestamp={status.nextAuctionStartTime}
                  >
                    {({ days, hours, minutes, seconds }) => (
                      <Row>
                        <Cell isFaded={days === 0}>{days} days</Cell>
                        <Cell isFaded={days + hours === 0}>{hours} hrs</Cell>
                        <Cell isFaded={days + hours + minutes === 0}>
                          {minutes} mins
                        </Cell>
                        <Cell isFaded={days + hours + minutes + seconds === 0}>
                          {seconds} segs
                        </Cell>
                      </Row>
                    )}
                  </CountDownProvider>
                </div>
                <CurrentPrice>
                  Current Price: {Web3.utils.fromWei(status.currentPrice)} ETH
                </CurrentPrice>
                <BuyBtn data-modal="buy" onClick={this.onOpenModal}>
                  Buy Metronome
                </BuyBtn>
                <Wallet seed={this.props.seed}>
                  {({ onBuy }) => (
                    <BuyMTNDrawer
                      onRequestClose={this.onCloseModal}
                      currentPrice={status.currentPrice}
                      isOpen={this.state.activeModal === 'buy'}
                      onBuy={onBuy}
                    />
                  )}
                </Wallet>
              </Body>
            )
          }
        </MTNAuctionProvider>
      </DarkLayout>
    );
  }
}
