import withRetryImportFormState from 'metronome-wallet-ui-logic/src/hocs/withRetryImportFormState'
import PropTypes from 'prop-types'
import TimeAgo from 'metronome-wallet-ui-logic/src/components/TimeAgo'
import styled from 'styled-components'
import React from 'react'

import ReadOnlyField from './ReadOnlyField'
import {
  ConfirmationWizard,
  DisplayValue,
  GasEditor,
  Drawer,
  Flex,
  Btn,
  Sp,
} from '../common'

const Message = styled.div`
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.5);
  padding-bottom: 2.4rem;

  & span {
    color: ${(p) => p.theme.colors.light};
  }
`

const ConfirmationContainer = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1.5;

  & > span,
  & > div {
    color: ${(p) => p.theme.colors.primary};
  }
`

const BtnContainer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  padding: 3.2rem 2.4rem;
`

class RetryImportDrawer extends React.Component {
  static propTypes = {
    destinationDisplayName: PropTypes.string.isRequired,
    originDisplayName: PropTypes.string.isRequired,
    gasEstimateError: PropTypes.bool,
    onRequestClose: PropTypes.func.isRequired,
    formattedTime: PropTypes.string.isRequired,
    onInputChange: PropTypes.func.isRequired,
    useCustomGas: PropTypes.bool.isRequired,
    timestamp: PropTypes.number.isRequired,
    resetForm: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    gasPrice: PropTypes.string,
    gasLimit: PropTypes.string,
    errors: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
    fee: PropTypes.string.isRequired,
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && prevProps.isOpen !== this.props.isOpen) {
      this.props.resetForm()
    }
  }

  renderConfirmation = () => (
    <ConfirmationContainer data-testid="confirmation">
      <React.Fragment>
        You will request an import of{' '}
        <DisplayValue inline value={this.props.value} post=" MET" /> from the{' '}
        <span>{this.props.originDisplayName}</span> blockchain to the{' '}
        <span>{this.props.destinationDisplayName}</span> blockchain.
      </React.Fragment>
    </ConfirmationContainer>
  )

  renderForm = (goToReview) => (
    <form onSubmit={goToReview} noValidate data-testid="port-form">
      <Sp py={4} px={3}>
        <Message>
          This Port operation was initiated{' '}
          <span data-rh={this.props.formattedTime}>
            <TimeAgo timestamp={this.props.timestamp} />
          </span>
          .
        </Message>
        <ReadOnlyField
          value={this.props.originDisplayName}
          label="Origin Blockchain"
          id="originDisplayName"
        />
        <Sp pt={3}>
          <Flex.Row>
            <Flex.Item grow="1">
              <ReadOnlyField
                value={<DisplayValue value={this.props.value} />}
                label="Amount (MET)"
                id="value"
              />
            </Flex.Item>
            <Sp px={1} />
            <Flex.Item grow="1">
              <ReadOnlyField
                value={<DisplayValue value={this.props.fee} />}
                label="Fee (MET)"
                id="fee"
              />
            </Flex.Item>
          </Flex.Row>
        </Sp>
        <Sp mt={4}>
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
