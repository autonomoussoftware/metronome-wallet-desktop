import PropTypes from 'prop-types'
import styled from 'styled-components'
import theme from '../theme'
import React from 'react'
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
  font-size: 1.1rem;
  letter-spacing: 0.4px;
  color: ${p => p.theme.colors.copy};
  text-transform: uppercase;
  opacity: ${({ isPending }) => (isPending ? '0.5' : '1')};
  text-align: right;
`

const Currency = styled.span`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
`

const Address = styled.span`
  letter-spacing: normal;
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-transform: initial;
`

const Amount = styled.div`
  line-height: 2.5rem;
  text-align: right;
  opacity: ${({ isPending }) => (isPending ? '0.5' : '1')};
  color: ${p => (p.isPending ? p.theme.colors.copy : p.theme.colors.primary)};
`

export default class TxRow extends React.Component {
  static propTypes = {
    transaction: PropTypes.shape({
      value: PropTypes.string.isRequired,
      hash: PropTypes.string.isRequired,
      from: PropTypes.string,
      to: PropTypes.string
    }).isRequired,
    meta: PropTypes.shape({
      outgoing: PropTypes.bool
    }).isRequired,
    pending: PropTypes.number
  }

  render() {
    const {
      transaction: { blockHash, value, from, to },
      meta: { outgoing },
      ...other
    } = this.props

    // TODO pending is the number of confirmations
    // it shall be calculated as (latestBlockNumber - blockNumber + 1)
    // latestBlockNumber can be taken from the eth-block event
    // blockNumber is a prop of props.transaction
    // set to 6 until proper calculation is in place
    const pending = blockHash ? 6 : 0

    // waiting for 6 block by convention
    const isPending = pending < 6

    const type = outgoing ? 'sent' : 'received'

    return (
      <Collapsable maxHeight="6.5rem" {...other}>
        <Tx>
          {(type === 'received' || type === 'sent') &&
            !isPending && <TxIcon color={theme.colors.primary} />}

          {type === 'converted' &&
            !isPending && <ConverterIcon color={theme.colors.primary} />}

          {type === 'auction' &&
            !isPending && <AuctionIcon color={theme.colors.primary} />}

          {isPending && <Pending>{pending}</Pending>}
          <div>
            <Amount isPending={isPending}>
              <DisplayValue value={value} maxSize="2rem" post=" ETH" />
            </Amount>
            <Details isPending={isPending}>
              {type === 'converted' && (
                <div>
                  <Currency>MTN</Currency> exchanged for{' '}
                  <Currency>ETH</Currency>
                </div>
              )}
              {type === 'received' && (
                <div>
                  {isPending ? 'Pending' : 'Received'} from{' '}
                  <Address>{from}</Address>
                </div>
              )}
              {type === 'auction' && (
                <div>
                  <Currency>MTN</Currency> purchased in auction
                </div>
              )}
              {type === 'sent' && (
                <div>
                  {isPending ? 'Pending' : 'Sent'} to <Address>{to}</Address>
                </div>
              )}
            </Details>
          </div>
        </Tx>
      </Collapsable>
    )
  }
}
