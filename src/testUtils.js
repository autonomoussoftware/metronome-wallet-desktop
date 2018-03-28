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
      <ThemeProvider theme={theme}>
        <React.Fragment>{element}</React.Fragment>
      </ThemeProvider>
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

/**
 * Add dataset property (data-foo attribute values) to nodes
 *
 * This hack is required because jsdom has no support for dataset yet
 * which prevents us from testing components that rely on it.
 * See https://github.com/jsdom/jsdom/issues/961
 *
 * element   : DOM node to add the dataset to
 * dataAttrs : attribute names to add to the node
 *
 * Usage:
 * <button data-testid="btn" data-modal="buy" data-foo="bar">Click</button>
 *
 * const btn = withDataset(getByTestId('btn'), 'modal', 'foo')
 * // btn.dataset === { modal: 'buy', foo: 'bar'}
 *
 */
export function withDataset(element, ...dataAttrs) {
  element.dataset = dataAttrs.reduce((acc, attr) => {
    acc[attr] = element.getAttribute(`data-${attr}`)
    return acc
  }, {})
  return element
}

/**
 * Return UTC timestamps relative to the current time
 * Useful for setting up different auction scenarios.
 */
export const twoWeeksAgo = () => Date.now() / 1000 - 60 * 60 * 24 * 7 * 2
export const oneHourAgo = () => Date.now() / 1000 - 60 * 60
export const inOneHour = () => Date.now() / 1000 + 60 * 60
export const inOneWeek = () => Date.now() / 1000 + 60 * 60 * 24 * 7
