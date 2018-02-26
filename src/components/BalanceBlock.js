import { DisplayValue } from './common'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Balance = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  & + & {
    border-top: 1px solid ${p => p.theme.colors.darkShade};
  }
`

const CoinSymbol = styled.div`
  border-radius: 14.1px;
  background-color: ${p => p.theme.colors.primary};
  width: 4.3rem;
  line-height: 3.2rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  @media (min-width: 900px) {
    width: 6.3rem;
    font-size: 2rem;
  }
`

const Value = styled.div`
  line-height: ${p => (p.large ? '3rem' : '2rem')};
  font-size: ${p => (p.large ? '3.2rem' : '2.4rem')};
  letter-spacing: ${p => (p.large ? '-1px' : 'inherit')};
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin: 1.6rem 3rem;
  flex-grow: 1;
  position: relative;
  top: -3px;

  @media (min-width: 900px) {
    margin: 2.4rem 3rem;
    line-height: ${p => (p.large ? '6rem' : '4rem')};
    font-size: ${p => (p.large ? '4.8rem' : '3.2rem')};
  }
`

const USDValue = styled.div`
  line-height: 2.4rem;
  font-size: 1.6rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  white-space: nowrap;
  opacity: ${p => (p.hide ? '0' : '1')};

  @media (min-width: 900px) {
    line-height: 3rem;
    font-size: 2.4rem;
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
          <CoinSymbol>MTN</CoinSymbol>
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
