import { DarkLayout, Text, Btn, Sp } from '../common'
import CountDownProvider from '../providers/CountDownProvider'
import BuyMTNDrawer from './BuyMTNDrawer'
import auction from '../services/auction'
import styled from 'styled-components'
import React from 'react'
import Web3 from 'web3'

const Row = styled.div`
  margin-top: 1.6rem;
  display: flex;
  border-radius: 4px;
  background-color: ${p => p.theme.colors.lightShade};
`

const Cell = styled.div`
  opacity: ${({ isFaded }) => (isFaded ? '0.5' : '1')};
  padding: 1.6rem;
  flex-grow: 1;
  flex-basis: 0;
  color: ${p => p.theme.colors.primary};
  line-height: 6rem;
  letter-spacing: -1px;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  border-left: 1px solid ${p => p.theme.colors.darkShade};
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
`

const CurrentPrice = styled.div`
  padding: 3.5rem 2.4rem;
  margin-top: 1.6rem;
  border-radius: 4px;
  background-color: ${p => p.theme.colors.lightShade};
  line-height: 4rem;
  font-size: 3.2rem;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

export default class Auction extends React.Component {
  state = {
    activeModal: null,
    status: null
  }

  componentDidMount() {
    // TODO: Retrive status after a new block is mined
    auction.getStatus().then(status => this.setState({ status }))
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  render() {
    return (
      <DarkLayout title="Metronome Auction">
        {this.state.status ? (
          <Sp py={4} px={6}>
            <Text>Time Remaining</Text>

            <CountDownProvider
              targetTimestamp={this.state.status.nextAuctionStartTime}
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

            <CurrentPrice>
              Current Price:{' '}
              {Web3.utils.fromWei(this.state.status.currentPrice)} ETH
            </CurrentPrice>
            <Sp mt={4}>
              <Btn data-modal="buy" onClick={this.onOpenModal}>
                Buy Metronome
              </Btn>
            </Sp>
            <BuyMTNDrawer
              onRequestClose={this.onCloseModal}
              currentPrice={this.state.status.currentPrice}
              isOpen={this.state.activeModal === 'buy'}
            />
          </Sp>
        ) : (
          <p>Loading...</p>
        )}
      </DarkLayout>
    )
  }
}
