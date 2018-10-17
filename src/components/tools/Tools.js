import withToolsState from 'metronome-wallet-ui-logic/src/hocs/withToolsState'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DarkLayout, Btn, Sp, TextInput, Flex } from '../common'
import ConfirmationWizard from '../ConfirmationWizard'
import ConfirmModal from '../ConfirmModal'

const Confirmation = styled.div`
  color: ${p => p.theme.colors.danger};
  background-color: ${p => p.theme.colors.darkShade};
  border-radius: 4px;
  padding: 0.8rem 1.6rem;
`
const ValidationMsg = styled.div`
  font-size: 1.4rem;
  margin-left: 1.6rem;
  opacity: 0.75;
`

class Tools extends React.Component {
  static propTypes = {
    onRescanTransactions: PropTypes.func.isRequired,
    isRecoverEnabled: PropTypes.bool.isRequired,
    onInputChange: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    mnemonic: PropTypes.string,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired,
    errors: PropTypes.shape({
      mnemonic: PropTypes.string
    }).isRequired
  }

  state = {
    activeModal: null
  }

  onCloseModal = () => {
    this.setState({ activeModal: null })
  }

  onRescanTransactionsClick = () => {
    this.setState({ activeModal: 'confirm-rescan' })
  }

  onWizardSubmit = password =>
    this.props
      .onSubmit(password)
      .then(() => this.props.history.push('/wallets'))

  renderConfirmation = () => (
    <Confirmation data-testid="confirmation">
      <h3>Are you sure?</h3>
      <p>This operation will overwrite and restart the current wallet!</p>
    </Confirmation>
  )

  renderForm = goToReview => {
    const { onInputChange, mnemonic, errors } = this.props

    return (
      <Sp mt={-2}>
        <h2>Recover a Wallet</h2>
        <form data-testid="recover-form" onSubmit={goToReview}>
          <p>
            Enter a valid twelve-word recovery phrase to recover another wallet.
          </p>
          <p>This action will replace your current stored seed!</p>
          <TextInput
            data-testid="mnemonic-field"
            autoFocus
            onChange={onInputChange}
            label="Recovery phrase"
            error={errors.mnemonic}
            value={mnemonic || ''}
            rows={2}
            id="mnemonic"
          />
          <Sp mt={4}>
            <Flex.Row align="center">
              <Btn disabled={!this.props.isRecoverEnabled} submit>
                Recover
              </Btn>
              {!this.props.isRecoverEnabled && (
                <ValidationMsg>
                  A recovery phrase must have exactly 12 words
                </ValidationMsg>
              )}
            </Flex.Row>
          </Sp>
        </form>
        <Sp mt={5}>
          <hr />
          <h2>Rescan Transactions List</h2>
          <p>
            This will clear your local cache and rescan all your wallet
            transactions.
          </p>
          <Btn onClick={this.onRescanTransactionsClick}>
            Rescan Transactions
          </Btn>
          <ConfirmModal
            onRequestClose={this.onCloseModal}
            onConfirm={this.props.onRescanTransactions}
            isOpen={this.state.activeModal === 'confirm-rescan'}
          />
        </Sp>
      </Sp>
    )
  }

  render() {
    return (
      <DarkLayout title="Tools" data-testid="tools-container">
        <Sp py={4} px={6}>
          <ConfirmationWizard
            renderConfirmation={this.renderConfirmation}
            confirmationTitle=""
            onWizardSubmit={this.onWizardSubmit}
            pendingTitle="Recovering..."
            successText="Wallet successfully recovered"
            renderForm={this.renderForm}
            validate={this.props.validate}
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

export default withToolsState(withRouter(Tools))
