import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import TxList from '../TxList'
import config from '../../config'
import React from 'react'
import 'react-testing-library/extend-expect'

const ACTIVE_ADDRESS = '0xf00'

describe('<TxList/>', () => {
  it('displays the receipt when clicking a transaction', () => {
    const { queryByTestId, getByTestId } = testUtils.reduxRender(
      <TxList />,
      getInitialState()
    )
    expect(getByTestId('tx-row')).toBeInTheDOM()
    expect(queryByTestId('receipt-modal')).not.toBeInTheDOM()
    const txRow = testUtils.withDataset(getByTestId('tx-row'), 'hash')
    Simulate.click(txRow)
    expect(queryByTestId('receipt-modal')).toBeInTheDOM()
  })
})

function getInitialState({ transactions = [] } = {}) {
  return {
    connectivity: { isOnline: true },
    blockchain: { height: 1, gasPrice: '100' },
    metronome: { transferAllowed: true },
    converter: { status: null },
    auction: { status: null },
    session: { isLoggedIn: true },
    rates: { ETH: { token: 'ETH', price: 100 } },
    wallets: {
      active: 'foo',
      allIds: ['foo'],
      byId: {
        foo: {
          addresses: {
            [ACTIVE_ADDRESS]: {
              token: {
                [config.MTN_TOKEN_ADDR]: { balance: '25000000000000000' }
              },
              balance: '50000000000000000',
              transactions: [getDummyTransaction()]
            }
          }
        }
      }
    }
  }
}

function getDummyTransaction() {
  return {
    meta: {
      metronome: {},
      tokens: {
        [config.MTN_TOKEN_ADDR]: {
          event: 'Transfer',
          processing: false,
          value:
            '0x000000000000000000000000000000000000000000000001e5b8fa8fe2ac0000'
        }
      }
    },
    receipt: {
      blockHash: '0x1234567890abcdef',
      blockNumber: 407574,
      cumulativeGasUsed: 38484,
      gasUsed: 38484,
      transactionHash: '0x1234567890abcdef',
      transactionIndex: 0
    },
    transaction: {
      transactionIndex: 0,
      blockNumber: 407574,
      blockHash: '0x1234567890abcdef',
      hash: '0x1234567890abcdef',
      value: '0',
      gasPrice: '5000000000',
      gas: 76968,
      from: '0x15dd2028C976beaA6668E286b496A518F457b5Cf',
      to: '0xde806D6efD432CDeE42573760682D99eDEdC1d89'
    }
  }
}
