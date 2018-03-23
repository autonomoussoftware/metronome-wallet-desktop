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
  return { ...renderResult, store, queryModalByTestId }
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
 * Test react-modal being rendered or not
 *
 * This needs a bit of tweaking because react-modal appends to document.body
 * and also there is an issue with jsdom and dataset.
 *
 * getter     : function that receives a data-testid and returns an HTML element
 * btnId      : data-testid of the button triggering the modal
 * modalId    : data-testid of the modal
 * shouldOpen : true if modal should open when the button is clicked
 *              useful for testing if the button is disabled
 */
export function testModalIsCalled(getter, btnId, modalId, shouldOpen = true) {
  const btn = getter(btnId)

  // Hack required because jsdom has no support for dataset yet.
  // See https://github.com/jsdom/jsdom/issues/961
  btn.dataset = { modal: btn.getAttribute('data-modal') }

  expect(queryModalByTestId(modalId)).toBeNull()
  Simulate.click(btn)

  if (shouldOpen) {
    expect(queryModalByTestId(modalId)).not.toBeNull()
  } else {
    expect(queryModalByTestId(modalId)).toBeNull()
  }

  document.body.innerHTML = ''
}

/**
 * Similar to queryByTestId() but using the document.body as root instead of
 * the rendered container. This is needed because react-modal appends the
 * modal to the document.body so it won't appear inside the container.
 */
export function queryModalByTestId(testId) {
  return document.body.querySelector(`[data-testid=${testId}]`)
}
