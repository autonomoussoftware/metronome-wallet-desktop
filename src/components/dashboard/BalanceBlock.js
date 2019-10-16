import withBalanceBlockState from 'metronome-wallet-ui-logic/src/hocs/withBalanceBlockState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DisplayValue } from '../common'

const relSize = ratio => `calc(100vw / ${ratio})`

const Balance = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75em 0;
  & + & {
    border-top: 1px solid ${p => p.theme.colors.darkShade};
  }
  @media (min-width: 1040px) {
    padding: 0.95em 0;
  }
`

const CoinSymbol = styled.div`
  border-radius: 14.1px;
  background-color: ${p => p.theme.colors.primary};
  width: 4em;
  line-height: 2.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;

  @media (min-width: 1040px) {
    line-height: 3.2rem;
    font-size: 2rem;
  }
`

const Value = styled.div`
  line-height: 1.5;
  font-weight: 600;
  letter-spacing: ${p => (p.large ? '-1px' : 'inherit')};
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin: 0 1.6rem;
  flex-grow: 1;
  position: relative;
  top: ${relSize(-400)};
  font-size: ${relSize(32)};

  @media (min-width: 800px) {
    font-size: ${relSize(44)};
  }

  @media (min-width: 1040px) {
    font-size: ${({ large }) => relSize(large ? 40 : 52)};
  }

  @media (min-width: 1440px) {
    font-size: ${({ large }) => (large ? '3.6rem' : '2.8rem')};
  }
`

const USDValue = styled.div`
  line-height: 1.5;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  white-space: nowrap;
  opacity: ${p => (p.hide ? '0' : '1')};
  position: relative;
  top: ${relSize(-400)};
  font-size: ${relSize(36)};

  @media (min-width: 800px) {
    font-size: ${relSize(68)};
  }

  @media (min-width: 1440px) {
    font-size: 2.2rem;
  }
`

class BalanceBlock extends React.Component {
  static propTypes = {
    coinBalanceUSD: PropTypes.string.isRequired,
    coinBalanceWei: PropTypes.string.isRequired,
    metBalanceWei: PropTypes.string.isRequired,
    coinSymbol: PropTypes.string.isRequired
  }

  render() {
    return (
      <React.Fragment>
        <Balance>
          <CoinSymbol>MET</CoinSymbol>
          <Value data-testid="met-balance" large>
            <DisplayValue value={this.props.metBalanceWei} />
          </Value>
          <USDValue data-testid="met-balance-usd" hide>
            N/A
          </USDValue>
        </Balance>
        <Balance>
          <CoinSymbol>{this.props.coinSymbol}</CoinSymbol>
          <Value data-testid="coin-balance">
            <DisplayValue value={this.props.coinBalanceWei} />
          </Value>
          <USDValue data-testid="coin-balance-usd">
            ${this.props.coinBalanceUSD} (USD)
          </USDValue>
        </Balance>
      </React.Fragment>
    )
  }
}

export default withBalanceBlockState(BalanceBlock)
