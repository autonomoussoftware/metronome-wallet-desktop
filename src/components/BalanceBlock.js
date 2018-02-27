import { DisplayValue } from './common'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const relSize = ratio => `calc((100vw - var(--extraWidth)) / ${ratio})`

const Balance = styled.div`
  --extraWidth: 11.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75em 0;
  & + & {
    border-top: 1px solid ${p => p.theme.colors.darkShade};
  }
  @media (min-width: 800px) {
    --extraWidth: 29.6rem;
  }
  @media (min-width: 1040px) {
    --extraWidth: 49.2rem;
    padding: 0.95em 0;
  }
`

const CoinSymbol = styled.div`
  border-radius: 14.1px;
  background-color: ${p => p.theme.colors.primary};
  width: 4rem;
  line-height: 2.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  @media (min-width: 1040px) {
    line-height: 3.2rem;
    width: 6.3rem;
    font-size: 2rem;
  }
`

const Value = styled.div`
  ${Balance} & {
    line-height: 1.5;
    letter-spacing: ${p => (p.large ? '-1px' : 'inherit')};
    text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
    margin: 0 1.6rem;
    flex-grow: 1;
    position: relative;
    top: ${relSize(-300)};
    font-size: ${relSize(35)};

    @media (min-width: 900px) {
      font-size: ${relSize(32)};
    }

    @media (min-width: 1040px) {
      font-size: ${({ large }) => relSize(large ? 20 : 27)};
    }
  }
`

const USDValue = styled.div`
  ${Balance} & {
    line-height: 1.5;
    font-weight: 600;
    text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
    white-space: nowrap;
    opacity: ${p => (p.hide ? '0' : '1')};
    position: relative;
    top: ${relSize(-400)};
    font-size: ${relSize(42)};

    @media (min-width: 900px) {
      font-size: ${relSize(40)};
    }
  }
`

class BalanceBlock extends React.Component {
  static propTypes = {
    mtnBalanceWei: PropTypes.string.isRequired,
    mtnBalanceUSD: PropTypes.string.isRequired,
    ethBalanceWei: PropTypes.string.isRequired,
    ethBalanceUSD: PropTypes.string.isRequired
  }

  render() {
    const {
      mtnBalanceWei,
      mtnBalanceUSD,
      ethBalanceWei,
      ethBalanceUSD
    } = this.props

    return (
      <React.Fragment>
        <Balance>
          <CoinSymbol>MET</CoinSymbol>
          <Value large>
            <DisplayValue maxSize="inherit" value={mtnBalanceWei} />
          </Value>
          <USDValue hide>${mtnBalanceUSD} (USD)</USDValue>
        </Balance>
        <Balance>
          <CoinSymbol>ETH</CoinSymbol>
          <Value>
            <DisplayValue maxSize="inherit" value={ethBalanceWei} />
          </Value>
          <USDValue>${ethBalanceUSD} (USD)</USDValue>
        </Balance>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  mtnBalanceWei: selectors.getMtnBalanceWei(state),
  mtnBalanceUSD: selectors.getMtnBalanceUSD(state),
  ethBalanceWei: selectors.getEthBalanceWei(state),
  ethBalanceUSD: selectors.getEthBalanceUSD(state)
})

export default connect(mapStateToProps)(BalanceBlock)
