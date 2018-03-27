import { layout as element } from '../Router'
import { MemoryRouter } from 'react-router'
import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import config from '../../config'
import React from 'react'

describe('<Router/>', () => {
  test('navigates to WALLET screen when clicking WALLET sidebar button', () => {
    clickAndExpect('wallets-nav-btn', 'dashboard-container', '/auction')
  })

  test('navigates to AUCTION screen when clicking AUCTION sidebar button', () => {
    clickAndExpect('auction-nav-btn', 'auction-container')
  })

  test('navigates to CONVERTER screen when clicking CONVERTER sidebar button', () => {
    clickAndExpect('converter-nav-btn', 'converter-container')
  })

  test('navigates to TOOLS screen when clicking TOOLS sidebar button', () => {
    clickAndExpect('tools-nav-btn', 'recover-container')
  })

  test('navigates to SETTINGS screen when clicking SETTINGS sidebar button', () => {
    clickAndExpect('settings-nav-btn', 'settings-container')
  })

  test('navigates to HELP screen when clicking HELP sidebar button', () => {
    clickAndExpect('help-nav-btn', 'help-container')
  })

  test('redirects to WALLET route for / route', () => {
    const { queryByTestId } = renderWithRouter('/')
    expect(queryByTestId('dashboard-container')).not.toBeNull()
  })
})

function clickAndExpect(linkTestId, pageTestId, initialRoute) {
  const { getByTestId, queryByTestId } = renderWithRouter(initialRoute)
  expect(queryByTestId(pageTestId)).toBeNull()
  Simulate.click(getByTestId(linkTestId), { button: 0 })
  expect(queryByTestId(pageTestId)).not.toBeNull()
}

function renderWithRouter(initialRoute = '/') {
  return testUtils.reduxRender(
    <MemoryRouter initialEntries={[initialRoute]}>{element}</MemoryRouter>,
    getInitialState()
  )
}

function getInitialState() {
  return {
    connectivity: { isOnline: true },
    blockchain: { height: 1 },
    metronome: { transferAllowed: true },
    converter: { status: null },
    auction: { status: null },
    session: { isLoggedIn: true },
    rates: { ETH: { token: 'ETH', price: 1 } },
    wallets: {
      active: 'foo',
      allIds: ['foo'],
      byId: {
        foo: {
          addresses: {
            '0xf00': {
              token: { [config.MTN_TOKEN_ADDR]: { balance: '1' } },
              balance: '1'
            }
          }
        }
      }
    }
  }
}
