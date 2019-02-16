import withRetryImportFormState from 'metronome-wallet-ui-logic/src/hocs/withRetryImportFormState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import {
  ConfirmationWizard,
  DisplayValue,
  GasEditor,
  Drawer,
  Btn,
  Sp
} from '../common'

const ConfirmationContainer = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1.5;

  & > span,
  & > div {
    color: ${p => p.theme.colors.primary};
  }
`

const BtnContainer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  padding: 3.2rem 2.4rem;
`

class RetryImportDrawer extends React.Component {
  static propTypes = {
    gasEstimateError: PropTypes.bool,
    onRequestClose: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired,
    useCustomGas: PropTypes.bool.isRequired,
    importData: PropTypes.shape({
      destinationChain: PropTypes.string.isRequired,
      originChain: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    }),
    resetForm: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    gasPrice: PropTypes.string,
    gasLimit: PropTypes.string,
    errors: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && prevProps.isOpen !== this.props.isOpen) {
      this.props.resetForm()
    }
  }

  renderConfirmation = () => (
    <ConfirmationContainer data-testid="confirmation">
      <React.Fragment>
        You will import{' '}
        <DisplayValue inline value={this.props.importData.value} post=" MET" />{' '}
        from the <span>{this.props.importData.originChain}</span> blockchain to
        the <span>{this.props.importData.destinationChain}</span> blockchain.
      </React.Fragment>
    </ConfirmationContainer>
  )

  renderForm = goToReview => (
    <form onSubmit={goToReview} noValidate data-testid="port-form">
      <Sp py={4} px={3}>
        <pre style={{ fontSize: '12px' }}>
          {JSON.stringify(this.props.importData, null, 2)}
        </pre>

        <Sp mt={3}>
          <GasEditor
            gasEstimateError={this.props.gasEstimateError}
            onInputChange={this.props.onInputChange}
            useCustomGas={this.props.useCustomGas}
            gasLimit={this.props.gasLimit}
            gasPrice={this.props.gasPrice}
            errors={this.props.errors}
          />
        </Sp>
      </Sp>

      <BtnContainer>
        <Btn submit block>
          Retry Import
        </Btn>
      </BtnContainer>
    </form>
  )

  render() {
    return (
      <Drawer
        onRequestClose={this.props.onRequestClose}
        data-testid="retry-import-drawer"
        isOpen={this.props.isOpen}
        title="Retry Metronome Import"
      >
        <ConfirmationWizard
          renderConfirmation={this.renderConfirmation}
          onWizardSubmit={this.props.onSubmit}
          pendingTitle="Importing MET..."
          renderForm={this.renderForm}
          editLabel="Edit this import"
          validate={this.props.validate}
        />
      </Drawer>
    )
  }
}

export default withRetryImportFormState(RetryImportDrawer)
