import ConvertETHtoMETForm from '../converter/ConvertETHtoMETForm'
import * as amountFields from './AmountFields.test.js'
import * as gasEditor from './GasEditor.test.js'
import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import React from 'react'

const element = <ConvertETHtoMETForm tabs={<div />} />

const ETHprice = 250

describe('<ConvertETHtoMETForm/>', () => {
  it.skip('should match its snapshot', () => {
    const { container } = testUtils.reduxRender(element, getInitialState())
    expect(container).toMatchSnapshot()
  })

  describe('When editing the amount fields', () => {
    amountFields.runEditTests(element, getInitialState(), ETHprice)
  })

  describe('When submitting the form', () => {
    amountFields.runValidateTests(element, getInitialState(), 'ethToMet-form')

    gasEditor.runValidateTests(element, getInitialState(), 'ethToMet-form')

    it('displays the confirmation view if there are no errors', () => {
      const { queryByTestId, getByTestId } = testUtils.reduxRender(
        element,
        getInitialState()
      )
      expect(queryByTestId('confirmation')).toBeNull()
      const amountField = getByTestId('ethAmount-field')
      const useMinimum = getByTestId('useMinimum-cb')
      amountField.value = '1'
      useMinimum.checked = false
      Simulate.change(amountField)
      Simulate.change(useMinimum)
      Simulate.submit(getByTestId('ethToMet-form'))
      expect(queryByTestId('confirmation')).not.toBeNull()
    })
  })
})

function getInitialState() {
  return testUtils.getInitialState({
    rates: { ETH: { token: 'ETH', price: ETHprice } }
  })
}
