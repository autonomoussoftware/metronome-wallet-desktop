import { Simulate } from 'react-testing-library'
import * as testUtils from '../../testUtils'
import GasEditor from '../GasEditor'
import React from 'react'

const element = (
  <GasEditor
    useCustomGas
    onChange={jest.fn()}
    gasLimit="21000"
    gasPrice="1"
    errors={{}}
  />
)

describe('<GasEditor/>', () => {
  it('should match its snapshot', () => {
    const { container } = testUtils.reduxRender(element)
    expect(container).toMatchSnapshot()
  })
})

export function runValidateTests(element, initialState, formTestId) {
  it('displays an error if GAS LIMIT is not provided', () => {
    const { getByTestId } = testUtils.reduxRender(element, initialState)
    Simulate.click(getByTestId('edit-gas-btn'))
    testUtils.testValidation(getByTestId, formTestId, {
      formData: { 'gas-limit-field': '' },
      errors: { 'gas-limit-field': 'Gas limit is required' }
    })
  })

  it('displays an error if GAS LIMIT is an invalid value', () => {
    const { getByTestId } = testUtils.reduxRender(element, initialState)
    Simulate.click(getByTestId('edit-gas-btn'))
    testUtils.testValidation(getByTestId, formTestId, {
      formData: { 'gas-limit-field': 'foo' },
      errors: { 'gas-limit-field': 'Invalid value' }
    })
  })

  it('displays an error if GAS LIMIT is not an integer', () => {
    const { getByTestId } = testUtils.reduxRender(element, initialState)
    Simulate.click(getByTestId('edit-gas-btn'))
    testUtils.testValidation(getByTestId, formTestId, {
      formData: { 'gas-limit-field': '1.1' },
      errors: { 'gas-limit-field': 'Gas limit must be an integer' }
    })
  })

  it('displays an error if GAS LIMIT is negative', () => {
    const { getByTestId } = testUtils.reduxRender(element, initialState)
    Simulate.click(getByTestId('edit-gas-btn'))
    testUtils.testValidation(getByTestId, formTestId, {
      formData: { 'gas-limit-field': '-1' },
      errors: { 'gas-limit-field': 'Gas limit must be greater than 0' }
    })
  })

  it('displays an error if GAS PRICE is not provided', () => {
    const { getByTestId } = testUtils.reduxRender(element, initialState)
    Simulate.click(getByTestId('edit-gas-btn'))
    testUtils.testValidation(getByTestId, formTestId, {
      formData: { 'gas-price-field': '' },
      errors: { 'gas-price-field': 'Gas price is required' }
    })
  })

  it('displays an error if GAS PRICE is an invalid value', () => {
    const { getByTestId } = testUtils.reduxRender(element, initialState)
    Simulate.click(getByTestId('edit-gas-btn'))
    testUtils.testValidation(getByTestId, formTestId, {
      formData: { 'gas-price-field': 'foo' },
      errors: { 'gas-price-field': 'Invalid value' }
    })
  })

  it('displays an error if GAS PRICE is lower than 1', () => {
    const { getByTestId } = testUtils.reduxRender(element, initialState)
    Simulate.click(getByTestId('edit-gas-btn'))
    testUtils.testValidation(getByTestId, formTestId, {
      formData: { 'gas-price-field': '0' },
      errors: { 'gas-price-field': 'Gas price can not be lower than 1' }
    })
  })
}
