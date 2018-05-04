import * as amountFields from './AmountFields.test.js'
import * as gasEditor from './GasEditor.test.js'
import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import BuyMETDrawer from '../BuyMETDrawer'
import config from '../../config'
import React from 'react'

const closeHandler = jest.fn()

const element = (
  <BuyMETDrawer
    tokenRemaining="100"
    onRequestClose={closeHandler}
    currentPrice="10"
    isOpen
  />
)

const ETHprice = 250

describe('<BuyMETDrawer/>', () => {
  it('should match its snapshot', () => {
    const { container } = testUtils.reduxRender(element, getInitialState())
    expect(container).toMatchSnapshot()
  })

  describe('When editing the amount fields', () => {
    amountFields.runEditTests(element, getInitialState(), ETHprice)
  })

  describe('When submitting the form', () => {
    amountFields.runValidateTests(element, getInitialState(), 'buy-form')

    gasEditor.runValidateTests(element, getInitialState(), 'buy-form')

    it('displays the confirmation view if there are no errors', () => {
      const { queryByTestId, getByTestId } = testUtils.reduxRender(
        element,
        getInitialState()
      )
      expect(queryByTestId('confirmation')).toBeNull()
      const amountField = getByTestId('ethAmount-field')
      amountField.value = '1'
      Simulate.change(amountField)
      Simulate.submit(getByTestId('buy-form'))
      expect(queryByTestId('confirmation')).not.toBeNull()
    })
  })
})

function getInitialState() {
  return {
    connectivity: { isOnline: true },
    blockchain: { height: 1, gasPrice: '100' },
    metronome: { transferAllowed: true },
    converter: { status: null },
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
    rates: { ETH: { token: 'ETH', price: ETHprice } },
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
