import { DarkLayout, Btn, Sp, TextInput } from '../common'
import { sendToMainProcess } from '../utils'
import { withRouter } from 'react-router-dom'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import bip39 from 'bip39'
import React from 'react'

const ErrorMsg = styled.p`
  color: ${p => p.theme.colors.danger};
`

class RecoverFromMnemonic extends React.Component {
  static propTypes = {
    password: PropTypes.string.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  }

  state = {
    mnemonic: null,
    errors: {},
    status: 'init',
    error: null
  }

  onSubmit = e => {
    e.preventDefault()

    const errors = this.validate()
    if (Object.keys(errors).length > 0) return this.setState({ errors })

    this.setState({ status: 'pending', error: null, errors: {} }, () =>
      sendToMainProcess('create-wallet', {
        password: this.props.password,
        mnemonic: this.state.mnemonic
      })
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
    const { mnemonic } = this.state
    const errors = {}

    if (!mnemonic) {
      errors.mnemonic = 'The phrase is required'
    } else if (!bip39.validateMnemonic(mnemonic)) {
      errors.mnemonic = "These words don't look like a valid recovery phrase"
    }

    return errors
  }

  onInputChanged = e => {
    const { id, value } = e.target
    this.setState({ [id]: value, error: null })
  }

  render() {
    const { mnemonic, error, errors } = this.state

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

const mapStateToProps = state => ({
  password: selectors.getPassword(state)
})

export default connect(mapStateToProps)(withRouter(RecoverFromMnemonic))
