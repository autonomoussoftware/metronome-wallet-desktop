import { DarkLayout, Btn, Sp, TextInput } from './common'
import { sendToMainProcess } from '../utils'
import { validateMnemonic } from '../validator'
import ConfirmationWizard from './ConfirmationWizard'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Confirmation = styled.div`
  color: ${p => p.theme.colors.danger};
  background-color: ${p => p.theme.colors.darkShade};
  border-radius: 4px;
  padding: 0.8rem 1.6rem;
`

class RecoverFromMnemonic extends React.Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  }

  state = {
    mnemonic: null,
    errors: {}
  }

  validate = () => {
    const errors = validateMnemonic(this.state.mnemonic)
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) this.setState({ errors })
    return !hasErrors
  }

  onInputChanged = e => {
    const { id, value } = e.target
    this.setState(state => ({
      ...state,
      [id]: value,
      errors: { ...state.errors, [id]: null }
    }))
  }

  onWizardSubmit = password => {
    return sendToMainProcess('create-wallet', {
      mnemonic: this.state.mnemonic,
      password
    }).then(() => this.props.history.push('/wallets'))
  }

  renderConfirmation = () => {
    return (
      <Confirmation>
        <h3>Are you sure?</h3>
        <p>This operation will overwrite and restart the current wallet!</p>
      </Confirmation>
    )
  }

  renderForm = goToReview => {
    const { mnemonic, errors } = this.state

    return (
      <form onSubmit={goToReview}>
        <p>Enter the 12 words to recover your wallet.</p>
        <p>This action will replace your current stored seed!</p>
        <TextInput
          autoFocus
          onChange={this.onInputChanged}
          label="Recovery phrase"
          error={errors.mnemonic}
          value={mnemonic || ''}
          rows={2}
          id="mnemonic"
        />
        <Sp mt={4}>
          <Btn submit>Recover</Btn>
        </Sp>
      </form>
    )
  }

  render() {
    return (
      <DarkLayout title="Recover wallet" data-testid="recover-container">
        <Sp py={4} px={6}>
          <ConfirmationWizard
            renderConfirmation={this.renderConfirmation}
            confirmationTitle=""
            onWizardSubmit={this.onWizardSubmit}
            pendingTitle="Recovering..."
            successText="Wallet successfully recovered"
            renderForm={this.renderForm}
            validate={this.validate}
            noCancel
            styles={{
              confirmation: {
                padding: 0
              },
              btns: {
                background: 'none',
                marginTop: '3.2rem',
                maxWidth: '200px',
                padding: 0
              }
            }}
          />
        </Sp>
      </DarkLayout>
    )
  }
}

export default withRouter(RecoverFromMnemonic)
