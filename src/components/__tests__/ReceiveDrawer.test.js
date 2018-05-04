import * as testUtils from '../../testUtils'
import ReceiveDrawer from '../ReceiveDrawer'
import { Simulate } from 'react-testing-library'
import React from 'react'
import 'react-testing-library/extend-expect'

const ACTIVE_ADDRESS = '0xf00'

const element = <ReceiveDrawer onRequestClose={jest.fn()} isOpen />

describe('<ReceiveDrawer/>', () => {
  it('matches its snapshot', () => {
    const { container } = testUtils.reduxRender(element, getInitialState())
    expect(container.firstChild).toMatchSnapshot()
  })

  it('displays the active address', () => {
    const { getByTestId } = testUtils.reduxRender(element, getInitialState())
    expect(getByTestId('address')).toHaveTextContent(ACTIVE_ADDRESS)
  })

  it('displays a message when the Copy button is clicked and the address copied', () => {
    const { getByTestId, queryByTestId } = testUtils.reduxRender(
      element,
      getInitialState()
    )
    expect(queryByTestId('btn-label')).toHaveTextContent('Copy')
    Simulate.click(getByTestId('copy-btn'))
    expect(queryByTestId('btn-label')).toHaveTextContent('Copied to clipboard!')
  })
})

function getInitialState() {
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
            [ACTIVE_ADDRESS]: {}
          }
        }
      }
    }
  }
}
