import * as amountFields from './AmountFields.test.js'
import * as gasEditor from './GasEditor.test.js'
import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import SendMETForm from '../SendMETForm'
import config from '../../config'
import React from 'react'

const element = <SendMETForm />

const ETHprice = 250

const VALID_ADDRESS = '0xD6758d1907Ed647605429d40cd19C58A6d05Eb8b'

describe('<SendMETForm/>', () => {
  it('should match its snapshot', () => {
    const { container } = testUtils.reduxRender(element, getInitialState())
    expect(container).toMatchSnapshot()
  })

  describe('When editing the amount field', () => {
    it('updates MET field when MAX button is clicked', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      const metField = getByTestId('metAmount-field')
      Simulate.click(getByTestId('max-btn'))
      expect(metField.value).toBe('5000')
    })
  })

  describe('When submitting the form', () => {
    it('displays an error if ADDRESS is not provided', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      testUtils.testValidation(getByTestId, 'sendMet-form', {
        formData: { 'toAddress-field': '' },
        errors: { 'toAddress-field': 'Address is required' }
      })
    })

    it('displays an error if ADDRESS is invalid', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      testUtils.testValidation(getByTestId, 'sendMet-form', {
        formData: { 'toAddress-field': 'foo' },
        errors: { 'toAddress-field': 'Invalid address' }
      })
    })

    it('displays an error if ADDRESS CHECKSUM is invalid', () => {
      const { getByTestId } = testUtils.reduxRender(element, getInitialState())
      testUtils.testValidation(getByTestId, 'sendMet-form', {
        formData: {
          'toAddress-field': '0xd6758d1907Ed647605429d40cd19C58A6d05Eb8b'
        },
        errors: { 'toAddress-field': 'Address checksum is invalid' }
      })
    })

    amountFields.runValidateTests(
      element,
      getInitialState(),
      'sendMet-form',
      'metAmount-field'
    )

    gasEditor.runValidateTests(element, getInitialState(), 'sendMet-form')

    it('displays the confirmation view if there are no errors', () => {
      const { queryByTestId, getByTestId } = testUtils.reduxRender(
        element,
        getInitialState()
      )
      expect(queryByTestId('confirmation')).toBeNull()
      const addressField = getByTestId('toAddress-field')
      addressField.value = VALID_ADDRESS
      Simulate.change(addressField)
      const amountField = getByTestId('metAmount-field')
      amountField.value = '1'
      Simulate.change(amountField)
      Simulate.submit(getByTestId('sendMet-form'))
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
              token: {
                [config.MTN_TOKEN_ADDR]: { balance: '5000000000000000000000' }
              },
              balance: '5000000000000000000000'
            }
          }
        }
      }
    }
  }
}
