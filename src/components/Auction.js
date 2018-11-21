import CountDownProvider from './providers/CountDownProvider'
import AuctionChartCard from './AuctionChartCard'
import * as selectors from '../selectors'
import BuyMETDrawer from './BuyMETDrawer'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import {
  DisplayValue,
  DarkLayout,
  LoadingBar,
  Text,
  Flex,
  Btn,
  Sp
} from './common'

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

const Body = styled.div`
  display: flex;
  margin-top: 3.2rem;
  align-items: center;
  flex-direction: column;

  @media (min-width: 1140px) {
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

  @media (min-width: 1140px) {
    margin-bottom: 0;
    order: 1;
    min-width: auto;
  }
`

const StatsContainer = styled.div`
  border-radius: 4px;
  background-color: ${p => p.theme.colors.lightShade};
  flex-grow: 1;
  width: 100%;
  margin-right: 0;

  @media (min-width: 1140px) {
    margin-right: 1.6rem;
    max-width: 660px;
  }
`

const Label = styled.div`
  line-height: 4rem;
  font-size: 2.4rem;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin-right: 1.6rem;
  white-space: nowrap;
`

const Badge = styled.div`
  display: inline-block;
  line-height: 2.5rem;
  border-radius: 1.4rem;
  background-color: ${p => p.theme.colors.bg.primary};
  font-size: 1.6rem;
  font-weight: 600;
  text-align: center;
  padding: 0.4rem 0.8rem;
  margin-right: 0.4rem;

  @media (min-width: 1140px) {
    font-size: 2rem;
  }
`
const Price = styled.div`
  font-size: 1.6rem;
  line-height: 3rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};

  @media (min-width: 1140px) {
    font-size: 2.4rem;
  }
`

const USDPrice = styled.div`
  line-height: 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: right;

  @media (min-width: 1140px) {
    font-size: 1.6rem;
  }
`

const AvailableAmount = styled.div`
  line-height: 1.6rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};

  @media (min-width: 1140px) {
    font-size: 2.4rem;
  }
`

class Auction extends React.Component {
  static propTypes = {
    buyFeatureStatus: PropTypes.oneOf(['offline', 'depleted', 'ok']).isRequired,
    auctionPriceUSD: PropTypes.string.isRequired,
    auctionStatus: PropTypes.shape({
      nextAuctionStartTime: PropTypes.number.isRequired,
      tokenRemaining: PropTypes.string.isRequired,
      currentAuction: PropTypes.string.isRequired,
      currentPrice: PropTypes.string.isRequired,
      genesisTime: PropTypes.number.isRequired
    })
  }

  state = {
    activeModal: null
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  // eslint-disable-next-line complexity
  render() {
    const { buyFeatureStatus, auctionPriceUSD, auctionStatus } = this.props

    const initialAuctionNotStarted =
      auctionStatus && auctionStatus.genesisTime * 1000 > Date.now()

    const initialAuctionEndTime =
      auctionStatus && auctionStatus.genesisTime + 7 * 24 * 60 * 60

    const isInitialAuction =
      auctionStatus &&
      auctionStatus.currentAuction === '0' &&
      !initialAuctionNotStarted &&
      initialAuctionEndTime * 1000 > Date.now()

    const dailyAuctionsNotStarted =
      auctionStatus && parseInt(auctionStatus.currentAuction, 10) < 1

    return (
      <DarkLayout title="Metronome Auction" data-testid="auction-container">
        {auctionStatus ? (
          <Container>
            <Text data-testid="title">
              {initialAuctionNotStarted
                ? 'Initial Auction starts in'
                : isInitialAuction
                  ? 'Time Remaining in Initial Auction'
                  : dailyAuctionsNotStarted
                    ? 'Initial Auction ended'
                    : 'Time Remaining in Daily Auction'}
            </Text>

            <CountDownProvider
              targetTimestamp={
                initialAuctionNotStarted
                  ? auctionStatus.genesisTime
                  : isInitialAuction || dailyAuctionsNotStarted
                    ? initialAuctionEndTime
                    : auctionStatus.nextAuctionStartTime
              }
            >
              {({ days, hours, minutes, seconds, inFuture }) =>
                inFuture ? (
                  <Row data-testid="countdown">
                    <Cell isFaded={days === 0}>{days} days</Cell>
                    <Cell isFaded={days + hours === 0}>{hours} hrs</Cell>
                    <Cell isFaded={days + hours + minutes === 0}>
                      {minutes} mins
                    </Cell>
                    <Cell isFaded={days + hours + minutes + seconds === 0}>
                      {seconds} secs
                    </Cell>
                  </Row>
                ) : (
                  <Row data-testid="waiting-next">
                    <Cell>Waiting to confirm auction start...</Cell>
                  </Row>
                )
              }
            </CountDownProvider>

            {(isInitialAuction || !dailyAuctionsNotStarted) && (
              <Body>
                <BuyBtn
                  data-disabled={buyFeatureStatus !== 'ok' ? true : null}
                  data-rh-negative
                  data-rh={
                    buyFeatureStatus === 'offline'
                      ? "Can't buy while offline"
                      : buyFeatureStatus === 'depleted'
                        ? 'No MET remaining in current auction'
                        : null
                  }
                  data-modal="buy"
                  data-testid="buy-btn"
                  onClick={buyFeatureStatus === 'ok' ? this.onOpenModal : null}
                >
                  Buy Metronome
                </BuyBtn>

                <StatsContainer data-testid="stats">
                  <Sp p={3}>
                    <Flex.Row justify="space-between" align="baseline">
                      <Label>Current Price</Label>
                      <Flex.Column>
                        <Flex.Row align="baseline">
                          <Badge>1 MET</Badge>
                          <Price>
                            <DisplayValue
                              pre=" = "
                              value={auctionStatus.currentPrice}
                              post=" ETH"
                            />
                          </Price>
                        </Flex.Row>
                        <USDPrice>{auctionPriceUSD}</USDPrice>
                      </Flex.Column>
                    </Flex.Row>
                  </Sp>
                  <Sp p={3}>
                    <Flex.Row justify="space-between" align="baseline">
                      <Label>Available</Label>
                      <AvailableAmount>
                        <DisplayValue
                          value={auctionStatus.tokenRemaining}
                          post=" MET"
                        />
                      </AvailableAmount>
                    </Flex.Row>
                  </Sp>
                  <AuctionChartCard />
                </StatsContainer>

                <BuyMETDrawer
                  tokenRemaining={auctionStatus.tokenRemaining}
                  onRequestClose={this.onCloseModal}
                  currentPrice={auctionStatus.currentPrice}
                  isOpen={this.state.activeModal === 'buy'}
                />
              </Body>
            )}
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
      </DarkLayout>
    )
  }
}

const mapStateToProps = state => ({
  buyFeatureStatus: selectors.buyFeatureStatus(state),
  auctionPriceUSD: selectors.getAuctionPriceUSD(state),
  auctionStatus: selectors.getAuctionStatus(state)
})

export default connect(mapStateToProps)(Auction)
