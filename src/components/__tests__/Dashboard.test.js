import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import Dashboard from '../Dashboard'
import config from '../../config'
import React from 'react'
import 'react-testing-library/extend-expect'

const ACTIVE_ADDRESS = '0x15dd2028C976beaA6668E286b496A518F457b5Cf'

describe('<Dashboard/>', () => {
  it('Displays active address in header', () => {
    const { getByTestId } = testUtils.reduxRender(
      <Dashboard />,
      getInitialState()
    )
    expect(getByTestId('address')).toBeInTheDOM()
    expect(getByTestId('address')).toHaveTextContent(ACTIVE_ADDRESS)
  })

  it('Displays active address ETH BALANCE', () => {
    const { getByTestId } = testUtils.reduxRender(
      <Dashboard />,
      getInitialState()
    )
    expect(getByTestId('eth-balance')).toBeInTheDOM()
    expect(getByTestId('eth-balance')).toHaveTextContent('0.05')
  })

  it('Displays active address ETH BALANCE in USD', () => {
    const { getByTestId } = testUtils.reduxRender(
      <Dashboard />,
      getInitialState()
    )
    expect(getByTestId('eth-balance-usd')).toHaveTextContent('$5.00 (USD)')
  })

  it('Displays active address MET BALANCE', () => {
    const { getByTestId } = testUtils.reduxRender(
      <Dashboard />,
      getInitialState()
    )
    expect(getByTestId('met-balance')).toHaveTextContent('0.025')
  })

  it('Displays the RECEIVE DRAWER when Receive button is clicked', () => {
    const { queryByTestId, getByTestId } = testUtils.reduxRender(
      <Dashboard />,
      getInitialState()
    )
    const btn = testUtils.withDataset(getByTestId('receive-btn'), 'modal')
    expect(queryByTestId('receive-drawer')).not.toBeInTheDOM()
    Simulate.click(btn)
    expect(queryByTestId('receive-drawer')).toBeInTheDOM()
  })

  it('Displays the SEND DRAWER when Send button is clicked', () => {
    const { queryByTestId, getByTestId } = testUtils.reduxRender(
      <Dashboard />,
      getInitialState()
    )
    const btn = testUtils.withDataset(getByTestId('send-btn'), 'modal')
    expect(queryByTestId('send-drawer')).not.toBeInTheDOM()
    Simulate.click(btn)
    expect(queryByTestId('send-drawer')).toBeInTheDOM()
  })

  describe('if the user has NO FUNDS', () => {
    it('SEND button is disabled', () => {
      const { queryByTestId, getByTestId } = testUtils.reduxRender(
        <Dashboard />,
        getInitialState({ ethBalance: '0', metBalance: '0' })
      )
      const btn = testUtils.withDataset(getByTestId('send-btn'), 'modal')
      expect(queryByTestId('send-drawer')).not.toBeInTheDOM()
      Simulate.click(btn)
      expect(queryByTestId('send-drawer')).not.toBeInTheDOM()
    })

    it('SEND button shows a tooltip when hovered', () => {
      const { getByTestId } = testUtils.reduxRender(
        <Dashboard />,
        getInitialState({ ethBalance: '0', metBalance: '0' })
      )
      expect(getByTestId('send-btn').getAttribute('data-rh')).toBe(
        'You need some funds to send'
      )
    })
  })

  describe('if connectivity is lost', () => {
    it('SEND button is disabled', () => {
      const { queryByTestId, getByTestId, store } = testUtils.reduxRender(
        <Dashboard />,
        getInitialState()
      )
      store.dispatch(goOffline())
      const btn = testUtils.withDataset(getByTestId('send-btn'), 'modal')
      expect(queryByTestId('send-drawer')).not.toBeInTheDOM()
      Simulate.click(btn)
      expect(queryByTestId('send-drawer')).not.toBeInTheDOM()
    })

    it('SEND button shows a tooltip when hovered', () => {
      const { getByTestId, store } = testUtils.reduxRender(
        <Dashboard />,
        getInitialState()
      )
      expect(getByTestId('send-btn').getAttribute('data-rh')).toBeNull()
      store.dispatch(goOffline())
      expect(getByTestId('send-btn').getAttribute('data-rh')).toBe(
        "Can't send while offline"
      )
    })
  })

  describe('If there are transactions to display', () => {
    it('displays the transactions list', () => {
      const { queryByTestId } = testUtils.reduxRender(
        <Dashboard />,
        getInitialState({
          transactions: [getDummyTransaction()]
        })
      )
      expect(queryByTestId('notx-msg')).not.toBeInTheDOM()
      expect(queryByTestId('tx-list')).toBeInTheDOM()
    })
  })

  describe('If there are NO transactions to display', () => {
    it('displays a message saying "No transactions"', () => {
      const { getByTestId } = testUtils.reduxRender(
        <Dashboard />,
        getInitialState()
      )
      expect(getByTestId('notx-msg')).toBeInTheDOM()
    })
  })
})

function goOffline() {
  return {
    type: 'connectivity-state-changed',
    payload: { ok: false }
  }
}

function getInitialState({
  metBalance = '25000000000000000',
  ethBalance = '50000000000000000',
  transactions = []
} = {}) {
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
                [config.MTN_TOKEN_ADDR]: { balance: metBalance }
              },
              balance: ethBalance,
              transactions
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
        '0xde806d6efd432cdee42573760682d99ededc1d89': {
          event: 'Transfer',
          processing: false,
          value:
            '0x000000000000000000000000000000000000000000000001e5b8fa8fe2ac0000'
        }
      }
    },
    receipt: {
      blockHash:
        '0x6fc6664565759e20bbbe62bc816cc2909c140ebd1d4f40c14d888ef18592e209',
      blockNumber: 407574,
      cumulativeGasUsed: 38484,
      gasUsed: 38484,
      transactionHash:
        '0xb7762b4afd014e1539db551b0647973c9a54d0a0f3e0659fb01042f757b50144',
      transactionIndex: 0
    },
    transaction: {
      transactionIndex: 0,
      blockNumber: 407574,
      blockHash:
        '0x6fc6664565759e20bbbe62bc816cc2909c140ebd1d4f40c14d888ef18592e209',
      hash:
        '0xb7762b4afd014e1539db551b0647973c9a54d0a0f3e0659fb01042f757b50144',
      value: '0',
      gasPrice: '5000000000',
      gas: 76968,
      from: '0x15dd2028C976beaA6668E286b496A518F457b5Cf',
      to: '0xde806D6efD432CDeE42573760682D99eDEdC1d89'
    }
  }
}
