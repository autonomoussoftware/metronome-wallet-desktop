import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DisplayValue, Flex, Sp } from '../common'

const Container = styled.div`
  border-radius: 4px;
  background-color: ${p => p.theme.colors.lightShade};
  flex-grow: 1;
  margin-right: 0;
  width: 100%;

  @media (min-width: 1180px) {
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
  background-color: ${p => p.theme.colors.primary};
  font-size: 1.6rem;
  font-weight: 600;
  text-align: center;
  padding: 0.4rem 0.8rem;
  margin-right: 0.4rem;

  @media (min-width: 920px) {
    font-size: 2rem;
  }
`
const Price = styled.div`
  font-size: 1.6rem;
  line-height: 3rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};

  @media (min-width: 920px) {
    font-size: 2.4rem;
  }
`

const USDPrice = styled.div`
  line-height: 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: right;

  @media (min-width: 920px) {
    font-size: 1.6rem;
  }
`

const AvailableAmount = styled.div`
  line-height: 1.6rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};

  @media (min-width: 920px) {
    font-size: 2.4rem;
  }
`

export default class Stats extends React.Component {
  static propTypes = {
    converterPriceUSD: PropTypes.string.isRequired,
    converterStatus: PropTypes.shape({
      currentPrice: PropTypes.string.isRequired,
      availableCoin: PropTypes.string.isRequired,
      availableMet: PropTypes.string.isRequired
    })
  }

  render() {
    return (
      <Container data-testid="stats">
        <Sp p={2}>
          <Flex.Row justify="space-between" align="baseline">
            <Label>Current Price</Label>
            <Flex.Column>
              <Flex.Row align="baseline">
                <Badge>1 MET</Badge>
                <Price>
                  <DisplayValue
                    pre=" = "
                    value={this.props.converterStatus.currentPrice}
                    post=" ETH"
                  />
                </Price>
              </Flex.Row>
              <USDPrice>${this.props.converterPriceUSD} (USD)</USDPrice>
            </Flex.Column>
          </Flex.Row>
        </Sp>
        <Sp p={2}>
          <Flex.Row justify="space-between" align="baseline">
            <Label>Available MET</Label>
            <AvailableAmount>
              <DisplayValue
                value={this.props.converterStatus.availableMet}
                post=" MET"
              />
            </AvailableAmount>
          </Flex.Row>
        </Sp>
        <Sp p={2}>
          <Flex.Row justify="space-between" align="baseline">
            <Label>Available ETH</Label>
            <AvailableAmount>
              <DisplayValue
                value={this.props.converterStatus.availableCoin}
                post=" ETH"
              />
            </AvailableAmount>
          </Flex.Row>
        </Sp>
      </Container>
    )
  }
}
