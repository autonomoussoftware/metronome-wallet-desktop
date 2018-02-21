import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'

import {
  ConverterIcon,
  DisplayValue,
  Collapsable,
  AuctionIcon,
  TxIcon
} from './common'
import theme from '../theme'
import config from '../config'
import * as selectors from '../selectors'

const Tx = styled.div`
  margin-left: 1.6rem;
  padding: 1.2rem 2.4rem 1.2rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -1px 0 0 ${p => p.theme.colors.lightShade} inset;
  &:hover {
    cursor: pointer;
  }
`

const Pending = styled.div`
  color: #ababab;
  border: 1px solid #ababab;
  border-radius: 1.2rem;
  height: 2.4rem;
  width: 2.4rem;
  line-height: 2.2rem;
  text-align: center;
  font-size: 1.2rem;
`

const Details = styled.div`
  line-height: 1.4rem;
  font-size: 1rem;
  letter-spacing: 0px;
  color: ${p => p.theme.colors.copy};
  text-transform: uppercase;
  opacity: ${({ isPending }) => (isPending ? '0.5' : '1')};
  text-align: right;

  @media (min-width: 800px) {
    font-size: 1.1rem;
    letter-spacing: 0.4px;
  }
`

const Currency = styled.span`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
`

const Address = styled.span`
  letter-spacing: normal;
  line-height: 1.6rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: initial;

  @media (min-width: 800px) {
    font-size: 1.3rem;
  }
`

const Amount = styled.div`
  line-height: 2.5rem;
  text-align: right;
  opacity: ${({ isPending }) => (isPending ? '0.5' : '1')};
  color: ${p => (p.isPending ? p.theme.colors.copy : p.theme.colors.primary)};
  display: flex;
  justify-content: flex-end;
`

const Arrow = styled.span`
  color: ${p => p.theme.colors.primary};
  position: relative;
  top: -6px;
  margin: 0 8px;
  transform: scale3d(1.5, 2, 1);
  display: inline-block;
`

class TxRow extends React.Component {
  static propTypes = {
    confirmations: PropTypes.number.isRequired,
    isPending: PropTypes.bool.isRequired,
    parsed: PropTypes.oneOfType([
      PropTypes.shape({
        txType: PropTypes.oneOf(['unknown']).isRequired
      }),

      PropTypes.shape({
        txType: PropTypes.oneOf(['sent']).isRequired,
        symbol: PropTypes.oneOf(['ETH', 'MTN']).isRequired,
        value: PropTypes.string.isRequired,
        to: PropTypes.string.isRequired
      }),

      PropTypes.shape({
        txType: PropTypes.oneOf(['received']).isRequired,
        symbol: PropTypes.oneOf(['ETH', 'MTN']).isRequired,
        value: PropTypes.string.isRequired,
        from: PropTypes.string.isRequired
      }),

      PropTypes.shape({
        txType: PropTypes.oneOf(['auction']).isRequired,
        mtnBoughtInAuction: PropTypes.string,
        ethSpentInAuction: PropTypes.string.isRequired
      }),

      PropTypes.shape({
        txType: PropTypes.oneOf(['converted']).isRequired,
        convertedFrom: PropTypes.oneOf(['ETH', 'MTN']).isRequired,
        fromValue: PropTypes.string.isRequired,
        toValue: PropTypes.string.isRequired
      })
    ]).isRequired
  }

  render() {
    const { confirmations, isPending, parsed: tx, ...other } = this.props

    return (
      <Collapsable maxHeight="6.5rem" {...other}>
        <Tx>
          {(tx.txType === 'received' || tx.txType === 'sent') &&
            !isPending && <TxIcon color={theme.colors.primary} />}

          {tx.txType === 'converted' &&
            !isPending && <ConverterIcon color={theme.colors.primary} />}

          {tx.txType === 'auction' &&
            !isPending && (
              <AuctionIcon
                color={
                  tx.mtnBoughtInAuction
                    ? theme.colors.primary
                    : theme.colors.danger
                }
              />
            )}

          {(tx.txType === 'unknown' || isPending) && (
            <Pending>{confirmations}</Pending>
          )}
          <div>
            <Amount isPending={isPending}>
              {tx.txType === 'auction' ? (
                <React.Fragment>
                  <DisplayValue
                    maxSize="2rem"
                    value={tx.ethSpentInAuction}
                    post=" ETH"
                  />
                  <React.Fragment>
                    <Arrow>&rarr;</Arrow>
                    <DisplayValue
                      maxSize="2rem"
                      value={tx.mtnBoughtInAuction || '0'}
                      post=" MTN"
                    />
                  </React.Fragment>
                </React.Fragment>
              ) : tx.txType === 'unknown' || tx.isProcessing ? (
                <div>New transaction</div>
              ) : (
                <DisplayValue
                  maxSize="2rem"
                  value={tx.value}
                  post={` ${tx.symbol}`}
                />
              )}
            </Amount>
            <Details isPending={isPending}>
              {tx.txType === 'converted' && (
                <div>
                  <Currency>MTN</Currency> exchanged for{' '}
                  <Currency>ETH</Currency>
                </div>
              )}
              {tx.txType === 'received' && (
                <div>
                  {isPending ? 'Pending' : 'Received'} from{' '}
                  <Address>{tx.from}</Address>
                </div>
              )}
              {tx.txType === 'auction' && (
                <div>
                  <Currency>MTN</Currency> purchased in auction
                </div>
              )}
              {tx.txType === 'sent' && (
                <div>
                  {isPending ? 'Pending' : 'Sent'} to{' '}
                  {tx.to === config.MTN_TOKEN_ADDR ? (
                    'MTN TOKEN CONTRACT'
                  ) : (
                    <Address>{tx.to}</Address>
                  )}
                </div>
              )}
              {tx.txType === 'unknown' && <div>Waiting for metadata</div>}
            </Details>
          </div>
        </Tx>
      </Collapsable>
    )
  }
}

const mapStateToProps = (state, props) => {
  const confirmations = selectors.getTxConfirmations(state, props)

  return {
    confirmations,
    isPending: confirmations < 6
  }
}

export default connect(mapStateToProps)(TxRow)
