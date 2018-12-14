import * as amountFields from './AmountFields.test.js'
import * as gasEditor from './GasEditor.test.js'
import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import SendETHForm from '../dashboard/SendETHForm'
import React from 'react'

const element = <SendETHForm tabs={<div />} />

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
  return testUtils.getInitialState({
    rates: { ETH: { token: 'ETH', price: ETHprice } }
  })
}
