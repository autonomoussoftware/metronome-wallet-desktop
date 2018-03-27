import { Simulate, flushPromises } from 'react-testing-library'
import Passwordrequest from '../Passwordrequest'
import * as testUtils from '../../testUtils'
import React from 'react'

const INVALID_PASSWORD = 'wrong!'
const VALID_PASSWORD = 'foo'

const onLoginSubmit = jest.fn(({ password }) => {
  return password === VALID_PASSWORD
    ? Promise.resolve()
    : Promise.reject(new Error())
})

const element = <Passwordrequest onLoginSubmit={onLoginSubmit} />

describe('<Passwordrequest/>', () => {
  describe('When submitting the password form', () => {
    it('displays an error if password is not provided', () => {
      const { getByTestId } = testUtils.reduxRender(element)
      testUtils.testValidation(getByTestId, 'login-form', {
        formData: {
          'pass-field': ''
        },
        errors: {
          'pass-field': 'Password is required'
        }
      })
    })

    it('calls onLoginSubmit with password as an argument', () => {
      const { getByTestId } = testUtils.reduxRender(element)
      const passField = getByTestId('pass-field')
      passField.value = VALID_PASSWORD
      Simulate.change(passField)

      Simulate.submit(getByTestId('login-form'))

      expect(onLoginSubmit).toHaveBeenCalledWith({
        password: VALID_PASSWORD
      })
    })

    it('displays an error message if onLoginSubmit is rejected', async () => {
      const { queryByTestId, getByTestId } = testUtils.reduxRender(element)
      const passField = getByTestId('pass-field')
      passField.value = INVALID_PASSWORD
      Simulate.change(passField)

      expect(queryByTestId('error-msg')).toBeNull()
      Simulate.submit(getByTestId('login-form'))
      await flushPromises()
      expect(queryByTestId('error-msg')).not.toBeNull()
    })
  })
})
