import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import SendDrawer from '../SendDrawer'
import config from '../../config'
import React from 'react'
import 'react-testing-library/extend-expect'

const closeHandler = jest.fn()

const getElement = defaultTab => (
  <SendDrawer onRequestClose={closeHandler} defaultTab={defaultTab} isOpen />
)

describe('<SendDrawer/>', () => {
  it('displays SEND ETH form when clicking the tab', () => {
    const { queryByTestId, getByTestId } = testUtils.reduxRender(
      getElement(),
      getInitialState()
    )
    expect(queryByTestId('sendEth-form')).toBeNull()
    Simulate.click(testUtils.withDataset(getByTestId('eth-tab'), 'tab'))
    expect(queryByTestId('sendEth-form')).not.toBeNull()
  })

  it('displays SEND MET form when clicking the tab', () => {
    const { queryByTestId, getByTestId } = testUtils.reduxRender(
      getElement('eth'),
      getInitialState()
    )
    expect(queryByTestId('sendMet-form')).toBeNull()
    Simulate.click(testUtils.withDataset(getByTestId('met-tab'), 'tab'))
    expect(queryByTestId('sendMet-form')).not.toBeNull()
  })

  describe('SEND MET tab is disabled and displays tooltip', () => {
    it('if MET TRANSFERS ARE DISABLED ', () => {
      const { queryByTestId, getByTestId } = testUtils.reduxRender(
        getElement('eth'),
        getInitialState({ transferAllowed: false })
      )
      Simulate.click(testUtils.withDataset(getByTestId('met-tab'), 'tab'))
      expect(queryByTestId('sendMet-form')).not.toBeInTheDOM()
      expect(getByTestId('met-tab').getAttribute('data-rh')).not.toBeNull()
      expect(getByTestId('met-tab').getAttribute('data-rh')).toBe(
        'MET transactions not enabled yet'
      )
    })

    it('if we are on the INITIAL AUCTION ', () => {
      const { queryByTestId, getByTestId } = testUtils.reduxRender(
        getElement('eth'),
        getInitialState({ isInitialAuction: true })
      )
      Simulate.click(testUtils.withDataset(getByTestId('met-tab'), 'tab'))
      expect(queryByTestId('sendMet-form')).not.toBeInTheDOM()
      expect(getByTestId('met-tab').getAttribute('data-rh')).not.toBeNull()
      expect(getByTestId('met-tab').getAttribute('data-rh')).toBe(
        'MET transactions are disabled during Initial Auction'
      )
    })

    it('if user HAS NO MET', () => {
      const { queryByTestId, getByTestId } = testUtils.reduxRender(
        getElement('eth'),
        getInitialState({ metBalance: '0' })
      )
      Simulate.click(testUtils.withDataset(getByTestId('met-tab'), 'tab'))
      expect(queryByTestId('sendMet-form')).not.toBeInTheDOM()
      expect(getByTestId('met-tab').getAttribute('data-rh')).not.toBeNull()
      expect(getByTestId('met-tab').getAttribute('data-rh')).toBe(
        'You need some MET to send'
      )
    })

    it('if user IS OFFLINE', () => {
      const { queryByTestId, getByTestId, store } = testUtils.reduxRender(
        getElement('eth'),
        getInitialState()
      )
      expect(getByTestId('met-tab').getAttribute('data-rh')).toBeNull()
      store.dispatch(goOffline())
      expect(getByTestId('met-tab').getAttribute('data-rh')).not.toBeNull()
      Simulate.click(testUtils.withDataset(getByTestId('met-tab'), 'tab'))
      expect(queryByTestId('sendMet-form')).not.toBeInTheDOM()
      expect(getByTestId('met-tab').getAttribute('data-rh')).toBe(
        "Can't send while offline"
      )
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
  transferAllowed = true,
  isInitialAuction = false,
  metBalance = '5000000000000000000000'
} = {}) {
  return testUtils.getInitialState({
    metronome: { transferAllowed },
    auction: { status: { currentAuction: isInitialAuction ? '0' : '1' } },
    rates: { ETH: { token: 'ETH', price: 250 } },
    wallets: {
      active: 'foo',
      allIds: ['foo'],
      byId: {
        foo: {
          addresses: {
            '0x15dd2028C976beaA6668E286b496A518F457b5Cf': {
              token: {
                [config.MET_TOKEN_ADDR]: { balance: metBalance }
              },
              balance: '5000000000000000000000'
            }
          }
        }
      }
    }
  })
}
