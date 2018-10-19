import withLoginState from 'metronome-wallet-ui-logic/src/hocs/withLoginState'
import * as utils from 'metronome-wallet-ui-logic/src/utils'
import PropTypes from 'prop-types'
import React from 'react'

import { TextInput, AltLayout, Btn, Sp } from './common'

class Login extends React.Component {
  static propTypes = {
    onInputChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    password: PropTypes.string,
    errors: utils.errorPropTypes('password'),
    status: utils.statusPropTypes,
    error: PropTypes.string
  }

  render() {
    return (
      <AltLayout title="Enter your password">
        <form onSubmit={this.props.onSubmit} data-testid="login-form">
          <Sp mt={4}>
            <TextInput
              data-testid="pass-field"
              autoFocus
              onChange={this.props.onInputChange}
              error={this.props.errors.password || this.props.error}
              value={this.props.password}
              label="Password"
              type="password"
              id="password"
            />
          </Sp>
          <Sp mt={6}>
            <Btn block submit disabled={this.props.status === 'pending'}>
              Login
            </Btn>
          </Sp>
        </form>
      </AltLayout>
    )
  }
}

export default withLoginState(Login)
