import * as amountFields from './AmountFields.test.js'
import * as gasEditor from './GasEditor.test.js'
import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import SendETHForm from '../SendETHForm'
import config from '../../config'
import React from 'react'

const element = <SendETHForm />

const ETHprice = 250

const VALID_ADDRESS = '0xD6758d1907Ed647605429d40cd19C58A6d05Eb8b'

describe('<SendETHForm/>', () => {
  it('should match its snapshot', () => {
    const { container } = testUtils.reduxRender(element, getInitialState())
    expect(container).toMatchSnapshot()
  })

  describe('When editing the amount fields', () => {
    amountFields.runEditTests(element, getInitialState(), ETHprice)
  })

  describe('When submitting the form', () => {
    it('displays an error if ADDRESS is not provided', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      testUtils.testValidation(getByTestId, 'sendEth-form', {
        formData: { 'toAddress-field': '' },
        errors: { 'toAddress-field': 'Address is required' }
      })
    })

    it('displays an error if ADDRESS is invalid', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      testUtils.testValidation(getByTestId, 'sendEth-form', {
        formData: { 'toAddress-field': 'foo' },
        errors: { 'toAddress-field': 'Invalid address' }
      })
    })

    it('displays an error if ADDRESS CHECKSUM is invalid', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      testUtils.testValidation(getByTestId, 'sendEth-form', {
        formData: {
          'toAddress-field': '0xd6758d1907Ed647605429d40cd19C58A6d05Eb8b'
        },
        errors: { 'toAddress-field': 'Address checksum is invalid' }
      })
    })

    amountFields.runValidateTests(element, getInitialState(), 'sendEth-form')

    gasEditor.runValidateTests(element, getInitialState(), 'sendEth-form')

    it('displays the confirmation view if there are no errors', () => {
      const { queryByTestId, getByTestId } = testUtils.reduxRender(
        element,
        getInitialState()
      )
      expect(queryByTestId('confirmation')).toBeNull()
      const addressField = getByTestId('toAddress-field')
      addressField.value = VALID_ADDRESS
      Simulate.change(addressField)
      const amountField = getByTestId('ethAmount-field')
      amountField.value = '1'
      Simulate.change(amountField)
      Simulate.submit(getByTestId('sendEth-form'))
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
    auction: { status: null },
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
