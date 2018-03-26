import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import BuyMETDrawer from '../BuyMETDrawer'
import config from '../../config'
import React from 'react'

jest.mock('react-modal', () => props => (props.isOpen ? props.children : null))

const closeHandler = jest.fn()
const element = (
  <BuyMETDrawer
    tokenRemaining="100"
    onRequestClose={closeHandler}
    currentPrice="10"
    isOpen
  />
)

describe('<BuyMETDrawer/>', () => {
  it('should match its snapshot', () => {
    const { container } = testUtils.reduxRender(element, getInitialState())
    expect(container).toMatchSnapshot()
  })

  describe('When editing the amount fields', () => {
    it('updates the USD field when ETH field changes', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      const ethField = getByTestId('ethAmount-field')
      const usdField = getByTestId('usdAmount-field')
      expect(ethField.value).toBe('')
      expect(usdField.value).toBe('')
      ethField.value = '1'
      Simulate.change(ethField)
      expect(usdField.value).toBe('250')
    })

    it('updates the ETH field when USD field changes', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      const ethField = getByTestId('ethAmount-field')
      const usdField = getByTestId('usdAmount-field')
      usdField.value = '500'
      Simulate.change(usdField)
      expect(ethField.value).toBe('2')
    })

    it('updates ETH and USD fields when MAX button is clicked', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      const ethField = getByTestId('ethAmount-field')
      const usdField = getByTestId('usdAmount-field')
      Simulate.click(getByTestId('max-btn'))
      expect(ethField.value).toBe('5000')
      expect(usdField.value).toBe('1250000')
    })

    it('displays a "Invalid amount" placeholder in USD field when ETH value is invalid', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      const ethField = getByTestId('ethAmount-field')
      const usdField = getByTestId('usdAmount-field')
      expect(usdField.placeholder).toBe('0.00')
      ethField.value = 'foo'
      Simulate.change(ethField)
      expect(usdField.value).toBe('')
      expect(usdField.placeholder).toBe('Invalid amount')
    })

    it('displays a "Invalid amount" placeholder in ETH field when USD value is invalid', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      const ethField = getByTestId('ethAmount-field')
      const usdField = getByTestId('usdAmount-field')
      expect(ethField.placeholder).toBe('0.00')
      usdField.value = 'foo'
      Simulate.change(usdField)
      expect(ethField.value).toBe('')
      expect(ethField.placeholder).toBe('Invalid amount')
    })
  })

  describe('When submitting the form', () => {
    it('displays an error if AMOUNT is not provided', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'ethAmount-field': '' },
        errors: { 'ethAmount-field': 'Amount is required' }
      })
    })

    it('displays an error if AMOUNT is negative', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'ethAmount-field': '-1' },
        errors: { 'ethAmount-field': 'Amount must be greater than 0' }
      })
    })

    it('displays an error if AMOUNT is an invalid value', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'ethAmount-field': 'foo' },
        errors: { 'ethAmount-field': 'Invalid amount' }
      })
    })

    it('displays an error if AMOUNT is more than what we have', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'ethAmount-field': '10000' },
        errors: { 'ethAmount-field': 'Insufficient funds' }
      })
    })

    it('displays an error if AMOUNT is not weiable', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'ethAmount-field': '0.0000000000000000000000000000001' },
        errors: { 'ethAmount-field': 'Invalid amount' }
      })
    })

    it('displays an error if GAS LIMIT is not provided', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      Simulate.click(getByTestId('edit-gas-btn'))
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'gas-limit-field': '' },
        errors: { 'gas-limit-field': 'Gas limit is required' }
      })
    })

    it('displays an error if GAS LIMIT is an invalid value', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      Simulate.click(getByTestId('edit-gas-btn'))
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'gas-limit-field': 'foo' },
        errors: { 'gas-limit-field': 'Invalid value' }
      })
    })

    it('displays an error if GAS LIMIT is not an integer', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      Simulate.click(getByTestId('edit-gas-btn'))
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'gas-limit-field': '1.1' },
        errors: { 'gas-limit-field': 'Gas limit must be an integer' }
      })
    })

    it('displays an error if GAS LIMIT is negative', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      Simulate.click(getByTestId('edit-gas-btn'))
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'gas-limit-field': '-1' },
        errors: { 'gas-limit-field': 'Gas limit must be greater than 0' }
      })
    })

    it('displays an error if GAS PRICE is not provided', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      Simulate.click(getByTestId('edit-gas-btn'))
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'gas-price-field': '' },
        errors: { 'gas-price-field': 'Gas price is required' }
      })
    })

    it('displays an error if GAS PRICE is an invalid value', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      Simulate.click(getByTestId('edit-gas-btn'))
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'gas-price-field': 'foo' },
        errors: { 'gas-price-field': 'Invalid value' }
      })
    })

    it('displays an error if GAS PRICE is negative', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      Simulate.click(getByTestId('edit-gas-btn'))
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'gas-price-field': '-1' },
        errors: { 'gas-price-field': 'Gas price must be greater than 0' }
      })
    })

    it('displays an error if GAS PRICE is not weiable', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      Simulate.click(getByTestId('edit-gas-btn'))
      testUtils.testValidation(getByTestId, 'buy-form', {
        formData: { 'gas-price-field': '0.0000000000000000000000000000001' },
        errors: { 'gas-price-field': 'Invalid value' }
      })
    })

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
    blockchain: { height: 1 },
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
