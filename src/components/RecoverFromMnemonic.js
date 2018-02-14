import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { withRouter } from 'react-router-dom'

import { sendToMainProcess } from '../utils'
import { DarkLayout, Btn, Sp, TextInput } from './common'
import { validateMnemonic, validatePassword } from '../validator'

const ErrorMsg = styled.p`
  color: ${p => p.theme.colors.danger};
`

class RecoverFromMnemonic extends React.Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  }

  state = {
    mnemonic: null,
    password: null,
    errors: {},
    status: 'init',
    error: null
  }

  onSubmit = e => {
    e.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    const { password, mnemonic } = this.state

    this.setState({ status: 'pending', error: null, errors: {} }, () =>
      sendToMainProcess('create-wallet', { password, mnemonic })
        .then(() => this.props.history.push('/wallets'))
        .catch(e =>
          this.setState({
            status: 'failure',
            error: e.message || 'Unknown error'
          })
        )
    )
  }

  validate = () => {
    const { password, mnemonic } = this.state

    return {
      ...validateMnemonic(mnemonic),
      ...validatePassword(password)
    }
  }

  onInputChanged = e => {
    const { id, value } = e.target
    this.setState(state => ({
      ...state,
      [id]: value,
      errors: { ...state.errors, [id]: null },
    }))
  }

  render() {
    const { password, mnemonic, error, errors } = this.state

    const weHave12words =
      mnemonic &&
      mnemonic
        .trim()
        .split(' ')
        .map(w => w.trim())
        .filter(w => w.length > 0).length === 12

    return (
      <DarkLayout title="Recover wallet">
        <Sp py={4} px={6}>
          <form onSubmit={this.onSubmit}>
            <p>Enter the 12 words to recover your wallet.</p>
            <p>This action will replace your current stored seed!</p>

            <TextInput
              autoFocus
              onChange={this.onInputChanged}
              label="Recovery phrase"
              error={errors.mnemonic}
              value={mnemonic || ''}
              rows="3"
              id="mnemonic"
            />

            <TextInput
              type="password"
              onChange={this.onInputChanged}
              label="Password"
              error={errors.password}
              value={password || ''}
              rows="3"
              id="password"
            />

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <Sp mt={4}>
              <Btn disabled={!weHave12words} submit>
                Recover
              </Btn>
            </Sp>
          </form>
        </Sp>
      </DarkLayout>
    )
  }
}

export default withRouter(RecoverFromMnemonic)
