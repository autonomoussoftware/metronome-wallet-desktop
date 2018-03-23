import { render, Simulate } from 'react-testing-library'
import { ThemeProvider } from 'styled-components'
import { Provider } from 'react-redux'
import createStore from './createStore'
import theme from './theme'
import React from 'react'

/**
 * The same render method of 'react-testing-library' but wrapped with
 * Redux store Provider and 'styled-components' ThemeProvider.
 *
 * element      : the React element you want to wrap
 * initialState : optional state to initialize the Redux store
 *
 * Returns the same object as render() but with an additional 'store'
 * property useful for dispatching actions inside your tests.
 */
export function reduxRender(element, initialState) {
  const store = createStore(initialState)

  const renderResult = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>{element}</ThemeProvider>
    </Provider>
  )
  return { ...renderResult, store }
}

/**
 * Declaratively test complex form validations
 *
 * getter   : function that receives a data-testid and returns an HTML element
 * formId   : data-testid of the form element
 * formData : object of type { [data-testid]: any } to populate the form
 * errors   : object of type { [data-testid]: String } with expected errors
 */
export function testValidation(getter, formId, { formData, errors }) {
  // Populate the specified form fields
  Object.keys(formData).forEach((fieldId, i) => {
    const field = getter(fieldId)
    field.value = formData[fieldId]
    Simulate.change(field)
  })

  // Submit the form
  Simulate.submit(getter(formId))

  // Check expected errors
  Object.keys(errors).forEach((fieldId, i) => {
    expect(getter(`${fieldId}-error`).textContent).toEqual(
      expect.stringContaining(errors[fieldId])
    )
  })
}
