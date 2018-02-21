import CountDownProvider from './providers/CountDownProvider'
import * as selectors from '../selectors'
import BuyMTNDrawer from './BuyMTNDrawer'
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

  @media (min-width: 1100px) {
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

  @media (min-width: 1100px) {
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

  @media (min-width: 1100px) {
    margin-right: 1.6rem;
    max-width: 660px;
  }
`

const Label = styled.div`
  line-height: 4rem;
  font-size: 2.4rem;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin-right: 2em;
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

  @media (min-width: 1100px) {
    font-size: 2rem;
  }
`
const Price = styled.div`
  font-size: 1.6rem;
  line-height: 3rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};

  @media (min-width: 1100px) {
    font-size: 2.4rem;
  }
`

const USDPrice = styled.div`
  line-height: 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: right;

  @media (min-width: 1100px) {
    font-size: 1.6rem;
  }
`

const AvailableAmount = styled.div`
  line-height: 1.6rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};

  @media (min-width: 1100px) {
    font-size: 2.4rem;
  }
`

class Auction extends React.Component {
  static propTypes = {
    auctionPriceUSD: PropTypes.string.isRequired,
    auctionStatus: PropTypes.shape({
      currentPrice: PropTypes.string.isRequired,
      genesisTime: PropTypes.number.isRequired
    })
  }

  state = {
    activeModal: null
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  render() {
    const { auctionPriceUSD, auctionStatus } = this.props

    const initialAuctionNotStarted =
      auctionStatus && auctionStatus.genesisTime * 1000 > Date.now()

    const isInitialAuction =
      auctionStatus && auctionStatus.currentAuction === '0'

    return (
      <DarkLayout title="Metronome Auction">
        {auctionStatus ? (
          <Container>
            <Text>
              {initialAuctionNotStarted
                ? 'Initial Auction starts in'
                : isInitialAuction
                  ? 'Time Remaining in Initial Auction'
                  : 'Time Remaining in Daily Auction'}
            </Text>

            <CountDownProvider
              targetTimestamp={
                initialAuctionNotStarted
                  ? auctionStatus.genesisTime
                  : auctionStatus.nextAuctionStartTime
              }
            >
              {({ days, hours, minutes, seconds, inFuture }) =>
                inFuture ? (
                  <Row>
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
                  <Row>
                    <Cell>Waiting to confirm auction start...</Cell>
                  </Row>
                )
              }
            </CountDownProvider>

            {!initialAuctionNotStarted && (
              <Body>
                <BuyBtn data-modal="buy" onClick={this.onOpenModal}>
                  Buy Metronome
                </BuyBtn>

                <StatsContainer>
                  <Sp p={3}>
                    <Flex.Row justify="space-between" align="baseline">
                      <Label>Current Price</Label>
                      <Flex.Column>
                        <Flex.Row align="baseline">
                          <Badge>1 MTN</Badge>
                          <Price>
                            <DisplayValue
                              maxSize="inherit"
                              pre=" = "
                              value={auctionStatus.currentPrice}
                              post=" ETH"
                            />
                          </Price>
                        </Flex.Row>
                        <USDPrice>${auctionPriceUSD}</USDPrice>
                      </Flex.Column>
                    </Flex.Row>
                  </Sp>
                  <Sp p={3}>
                    <Flex.Row justify="space-between" align="baseline">
                      <Label>Available</Label>
                      <AvailableAmount>
                        <DisplayValue
                          maxSize="inherit"
                          value={auctionStatus.tokenRemaining}
                          post=" MTN"
                        />
                      </AvailableAmount>
                    </Flex.Row>
                  </Sp>
                </StatsContainer>

                <BuyMTNDrawer
                  onRequestClose={this.onCloseModal}
                  currentPrice={auctionStatus.currentPrice}
                  isOpen={this.state.activeModal === 'buy'}
                />
              </Body>
            )}
          </Container>
        ) : (
          <Sp p={6}>
            <LoadingContainer>
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
  auctionPriceUSD: selectors.getAuctionPriceUSD(state),
  auctionStatus: selectors.getAuctionStatus(state)
})

export default connect(mapStateToProps)(Auction)
