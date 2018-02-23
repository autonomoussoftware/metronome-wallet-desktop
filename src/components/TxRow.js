import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import config from '../config'
import React from 'react'
import theme from '../theme'
import {
  ConverterIcon,
  DisplayValue,
  Collapsable,
  AuctionIcon,
  TxIcon
} from './common'

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

const Failed = styled.span`
  line-height: 1.6rem;
  color: ${p => p.theme.colors.danger};
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
  color: ${p =>
    p.isPending || p.isCancelApproval
      ? p.theme.colors.copy
      : p.isFailed ? p.theme.colors.danger : p.theme.colors.primary};
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
    in: PropTypes.bool.isRequired,
    parsed: PropTypes.oneOfType([
      PropTypes.shape({
        txType: PropTypes.oneOf(['unknown']).isRequired
      }),

      PropTypes.shape({
        txType: PropTypes.oneOf(['sent']).isRequired,
        symbol: PropTypes.oneOf(['ETH', 'MTN']).isRequired,
        value: PropTypes.string.isRequired,
        isCancelApproval: PropTypes.bool.isRequired,
        approvedValue: PropTypes.string,
        isApproval: PropTypes.bool.isRequired,
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
        fromValue: PropTypes.string,
        toValue: PropTypes.string
      })
    ]).isRequired
  }

  // Prevent superfluous re-renders to improve performance.
  // Only update while waiting for confirmations or transitioning.
  shouldComponentUpdate({ in: transitioningIn }) {
    return this.props.confirmations < 6 || transitioningIn !== this.props.in
  }

  render() {
    const { confirmations, parsed: tx, ...other } = this.props
    const isPending = confirmations < 6
    const isFailed =
      (tx.txType === 'auction' &&
        !tx.mtnBoughtInAuction &&
        confirmations > 0) ||
      tx.contractCallFailed

    return (
      <Collapsable maxHeight="6.5rem" {...other}>
        <Tx>
          {(tx.txType === 'received' || tx.txType === 'sent') &&
            !isPending && (
              <TxIcon
                color={
                  tx.contractCallFailed
                    ? theme.colors.danger
                    : theme.colors.primary
                }
              />
            )}

          {tx.txType === 'converted' &&
            !isPending && (
              <ConverterIcon
                color={
                  tx.contractCallFailed
                    ? theme.colors.danger
                    : theme.colors.primary
                }
              />
            )}

          {tx.txType === 'auction' &&
            !isPending && (
              <AuctionIcon
                color={
                  tx.mtnBoughtInAuction && !tx.contractCallFailed
                    ? theme.colors.primary
                    : theme.colors.danger
                }
              />
            )}

          {(tx.txType === 'unknown' || isPending) && (
            <Pending>{confirmations}</Pending>
          )}
          <div>
            <Amount
              isCancelApproval={tx.isCancelApproval}
              isPending={isPending}
              isFailed={isFailed}
            >
              {tx.txType === 'auction' ? (
                <React.Fragment>
                  <DisplayValue
                    maxSize="2rem"
                    value={tx.ethSpentInAuction}
                    post=" ETH"
                  />

                  {tx.mtnBoughtInAuction && (
                    <React.Fragment>
                      <Arrow>&rarr;</Arrow>
                      <DisplayValue
                        maxSize="2rem"
                        value={tx.mtnBoughtInAuction}
                        post=" MTN"
                      />
                    </React.Fragment>
                  )}
                </React.Fragment>
              ) : tx.txType === 'converted' ? (
                <React.Fragment>
                  {tx.fromValue ? (
                    <DisplayValue
                      maxSize="2rem"
                      value={tx.fromValue}
                      post={tx.convertedFrom === 'ETH' ? ' ETH' : ' MTN'}
                    />
                  ) : (
                    <div>New transaction</div>
                  )}

                  {tx.fromValue &&
                    tx.toValue && (
                      <React.Fragment>
                        <Arrow>&rarr;</Arrow>
                        <DisplayValue
                          maxSize="2rem"
                          value={tx.toValue}
                          post={tx.convertedFrom === 'ETH' ? ' MTN' : ' ETH'}
                        />
                      </React.Fragment>
                    )}
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
              {(tx.txType === 'auction' && !tx.mtnBoughtInAuction) ||
              tx.contractCallFailed ? (
                <Failed>Failed Transaction</Failed>
              ) : (
                <React.Fragment>
                  {tx.txType === 'converted' && (
                    <div>
                      {isPending && 'Pending conversion from '}
                      <Currency>{tx.convertedFrom}</Currency>
                      {isPending ? ' to ' : ' converted to '}
                      <Currency>
                        {tx.convertedFrom === 'ETH' ? 'MTN' : 'ETH'}
                      </Currency>
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
                      {isPending
                        ? tx.isApproval
                          ? 'Pending allowance for'
                          : tx.isCancelApproval
                            ? 'Pending cancel allowance for'
                            : 'Pending to'
                        : tx.isApproval
                          ? 'Allowance set for'
                          : tx.isCancelApproval
                            ? 'Allowance cancelled for'
                            : 'Sent to'}{' '}
                      {tx.to === config.MTN_TOKEN_ADDR ? (
                        'MTN TOKEN CONTRACT'
                      ) : tx.to === config.CONVERTER_ADDR ? (
                        'CONVERTER CONTRACT'
                      ) : (
                        <Address>{tx.to}</Address>
                      )}
                    </div>
                  )}
                  {tx.txType === 'unknown' && <div>Waiting for metadata</div>}
                </React.Fragment>
              )}
            </Details>
          </div>
        </Tx>
      </Collapsable>
    )
  }
}

const mapStateToProps = (state, props) => ({
  confirmations: selectors.getTxConfirmations(state, props)
})

export default connect(mapStateToProps)(TxRow)
