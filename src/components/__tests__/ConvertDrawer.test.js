import * as testUtils from '../../testUtils'
import ConvertDrawer from '../ConvertDrawer'
import { Simulate } from 'react-testing-library'
import config from '../../config'
import React from 'react'

const closeHandler = jest.fn()

const getElement = defaultTab => (
  <ConvertDrawer onRequestClose={closeHandler} defaultTab={defaultTab} isOpen />
)

describe('<ConvertDrawer/>', () => {
  it('displays MET TO ETH form when clicking the tab', () => {
    const { queryByTestId, getByTestId } = testUtils.reduxRender(
      getElement(),
      getInitialState()
    )
    expect(queryByTestId('metToEth-form')).toBeNull()
    Simulate.click(testUtils.withDataset(getByTestId('metToEth-tab'), 'tab'))
    expect(queryByTestId('metToEth-form')).not.toBeNull()
  })

  it('displays ETH TO MET form when clicking the tab', () => {
    const { queryByTestId, getByTestId } = testUtils.reduxRender(
      getElement('metToEth'),
      getInitialState()
    )
    expect(queryByTestId('ethToMet-form')).toBeNull()
    Simulate.click(testUtils.withDataset(getByTestId('ethToMet-tab'), 'tab'))
    expect(queryByTestId('ethToMet-form')).not.toBeNull()
  })
})

function getInitialState() {
  return {
    connectivity: { isOnline: true },
    blockchain: { height: 1 },
    metronome: { transferAllowed: true },
    converter: {
      status: {
        currentPrice: '10'
      }
    },
    auction: {
      status: {
        nextAuctionStartTime: testUtils.inOneHour(),
        tokenRemaining: '100',
        currentAuction: '5',
        currentPrice: '10',
        genesisTime: testUtils.twoWeeksAgo()
      }
    },
    session: { isLoggedIn: true },
    rates: { ETH: { token: 'ETH', price: 250 } },
    wallets: {
      active: 'foo',
      allIds: ['foo'],
      byId: {
        foo: {
          addresses: {
            '0xf00': {
              token: { [config.MTN_TOKEN_ADDR]: { balance: '0' } },
              balance: '5000000000000000000000'
            }
          }
        }
      }
    }
  }
}
