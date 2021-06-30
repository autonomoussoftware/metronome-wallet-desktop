import * as amountFields from './AmountFields.test.js'
import * as gasEditor from './GasEditor.test.js'
import * as testUtils from '../../testUtils'
import BuyMETDrawer from '../auction/BuyMETDrawer'
import { Simulate } from 'react-testing-library'
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
  return testUtils.getInitialState({
    rates: { ETH: { token: 'ETH', price: ETHprice } },
  })
}
