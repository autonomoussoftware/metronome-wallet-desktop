/* eslint-disable require-path-exists/exists */
/* eslint-disable import/no-unresolved */
import ConvertMETtoETHForm from '../converter/ConvertMETtoETHForm'
import * as amountFields from './AmountFields.test.js'
import * as gasEditor from './GasEditor.test.js'
import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import React from 'react'

const element = <ConvertMETtoETHForm tabs={<div />} />

const ETHprice = 250

describe('<ConvertMETtoETHForm/>', () => {
  it.skip('should match its snapshot', () => {
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
    amountFields.runValidateTests(
      element,
      getInitialState(),
      'metToEth-form',
      'metAmount-field'
    )

    gasEditor.runValidateTests(element, getInitialState(), 'metToEth-form')

    it('displays the confirmation view if there are no errors', () => {
      const { queryByTestId, getByTestId } = testUtils.reduxRender(
        element,
        getInitialState()
      )
      expect(queryByTestId('confirmation')).toBeNull()
      const amountField = getByTestId('metAmount-field')
      const useMinimum = getByTestId('useMinimum-cb')
      amountField.value = '1'
      useMinimum.checked = false
      Simulate.change(amountField)
      Simulate.change(useMinimum)
      Simulate.submit(getByTestId('metToEth-form'))
      expect(queryByTestId('confirmation')).not.toBeNull()
    })
  })
})

function getInitialState() {
  return testUtils.getInitialState({
    rates: { ETH: { token: 'ETH', price: ETHprice } }
  })
}
