import withAuctionState from 'metronome-wallet-ui-logic/src/hocs/withAuctionState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DarkLayout, LastUpdated, LoadingBar, Text, Btn, Sp } from '../common'
import BuyMETDrawer from './BuyMETDrawer'
import CountDown from './CountDown'
import Stats from './Stats'

const Container = styled.div`
  padding: 3.2rem 2.4rem;
  @media (min-width: 800px) {
    padding: 3.2rem 4.8rem;
  }
`

const LoadingContainer = styled.div`
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
`

const Body = styled.div`
  display: flex;
  margin-top: 3.2rem;
  align-items: center;
  flex-direction: column;

  @media (min-width: 1200px) {
    align-items: flex-start;
    margin-top: 4.8rem;
    flex-direction: row;
  }
`

const BuyBtn = styled(Btn)`
  order: 0;
  white-space: nowrap;
  margin-bottom: 3.2rem;
  min-width: 300px;

  @media (min-width: 1200px) {
    margin-bottom: 0;
    order: 1;
    min-width: auto;
  }
`

class Auction extends React.Component {
  static propTypes = {
    countdownTargetTimestamp: PropTypes.number,
    buyDisabledReason: PropTypes.string,
    auctionPriceUSD: PropTypes.string.isRequired,
    auctionStatus: PropTypes.object,
    buyDisabled: PropTypes.bool.isRequired,
    lastUpdated: PropTypes.number,
    title: PropTypes.string
  }

  state = {
    activeModal: null
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  render() {
    return (
      <DarkLayout title="Metronome Auction" data-testid="auction-container">
        {this.props.auctionStatus ? (
          <Container>
            <Text data-testid="title">{this.props.title}</Text>

            <CountDown targetTimestamp={this.props.countdownTargetTimestamp} />

            <Body>
              <BuyBtn
                data-rh-negative
                data-disabled={this.props.buyDisabled}
                data-testid="buy-btn"
                data-modal="buy"
                onClick={this.props.buyDisabled ? null : this.onOpenModal}
                data-rh={this.props.buyDisabledReason}
              >
                Buy Metronome
              </BuyBtn>

              <Stats
                auctionPriceUSD={this.props.auctionPriceUSD}
                auctionStatus={this.props.auctionStatus}
              />

              <BuyMETDrawer
                onRequestClose={this.onCloseModal}
                isOpen={this.state.activeModal === 'buy'}
              />
            </Body>
          </Container>
        ) : (
          <Sp p={6}>
            <LoadingContainer data-testid="waiting">
              <Text>Waiting for auction status...</Text>
              <Sp py={2}>
                <LoadingBar />
              </Sp>
            </LoadingContainer>
          </Sp>
        )}
        <Sp px={6}>
          <LastUpdated timestamp={this.props.lastUpdated} />
        </Sp>
      </DarkLayout>
    )
  }
}

export default withAuctionState(Auction)
