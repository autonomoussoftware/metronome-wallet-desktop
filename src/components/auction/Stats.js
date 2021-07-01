import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DisplayValue, Flex, Sp } from '../common'

const Container = styled.div`
  border-radius: 4px;
  background-color: ${p => p.theme.colors.lightShade};
  flex-grow: 1;
  width: 100%;
  margin-right: 0;

  @media (min-width: 1200px) {
    margin-right: 1.6rem;
    max-width: 660px;
  }
`

const Label = styled.div`
  line-height: 4rem;
  font-size: 1.6rem;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin-right: 1.6rem;
  white-space: nowrap;

  @media (min-width: 1100px) {
    font-size: 2.4rem;
  }
`

const Badge = styled.div`
  display: inline-block;
  line-height: 2.5rem;
  border-radius: 1.4rem;
  background-color: ${p => p.theme.colors.primary};
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

export default class Stats extends React.Component {
  static propTypes = {
    auctionPriceUSD: PropTypes.string.isRequired,
    auctionStatus: PropTypes.shape({
      tokenRemaining: PropTypes.string.isRequired,
      currentPrice: PropTypes.string.isRequired
    })
  }

  render() {
    const { auctionPriceUSD, auctionStatus } = this.props

    return (
      <Container data-testid="stats">
        <Sp p={3}>
          <Flex.Row justify="space-between" align="baseline">
            <Label>Current Price</Label>
            <Flex.Column>
              <Flex.Row align="baseline">
                <Badge>1 MET</Badge>
                <Price>
                  <DisplayValue
                    isCoin
                    value={auctionStatus.currentPrice}
                    pre=" = "
                  />
                </Price>
              </Flex.Row>
              <USDPrice>${auctionPriceUSD} (USD)</USDPrice>
            </Flex.Column>
          </Flex.Row>
        </Sp>
        <Sp p={3}>
          <Flex.Row justify="space-between" align="baseline">
            <Label>Available</Label>
            <AvailableAmount>
              <DisplayValue value={auctionStatus.tokenRemaining} post=" MET" />
            </AvailableAmount>
          </Flex.Row>
        </Sp>
      </Container>
    )
  }
}
