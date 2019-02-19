import withPortFormState from 'metronome-wallet-ui-logic/src/hocs/withPortFormState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import ReadOnlyField from './ReadOnlyField'
import FeeEstimates from './FeeEstimates'
import {
  ConfirmationWizard,
  DisplayValue,
  GasEditor,
  TextInput,
  FieldBtn,
  Selector,
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

class PortDrawer extends React.Component {
  static propTypes = {
    availableDestinations: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    ).isRequired,
    sourceDisplayName: PropTypes.string.isRequired,
    gasEstimateError: PropTypes.bool,
    onRequestClose: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired,
    availableMet: PropTypes.string.isRequired,
    useCustomGas: PropTypes.bool.isRequired,
    destination: PropTypes.string.isRequired,
    onMaxClick: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
    metAmount: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    gasPrice: PropTypes.string,
    gasLimit: PropTypes.string,
    feeError: PropTypes.string,
    errors: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    fee: PropTypes.string
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && prevProps.isOpen !== this.props.isOpen) {
      this.props.resetForm()
    }
  }

  renderConfirmation = () => {
    const destination = this.props.availableDestinations.find(
      ({ value }) => value === this.props.destination
    )
    return (
      <ConfirmationContainer data-testid="confirmation">
        <React.Fragment>
          You will port{' '}
          <DisplayValue inline value={this.props.metAmount} toWei post=" MET" />{' '}
          from the <span>{this.props.sourceDisplayName}</span> blockchain to the{' '}
          <span>{destination.label}</span> blockchain, paying a fee of
          approximately{' '}
          <DisplayValue inline value={this.props.fee} post=" MET" />.
        </React.Fragment>
      </ConfirmationContainer>
    )
  }

  renderForm = goToReview => (
    <form onSubmit={goToReview} noValidate data-testid="port-form">
      <Sp py={4} px={3}>
        <ReadOnlyField
          suffix={<DisplayValue value={this.props.availableMet} post=" MET" />}
          value={this.props.sourceDisplayName}
          label="Source"
          id="source-field"
        />
        <Sp py={3}>
          <Selector
            data-testid="destination-field"
            disabled={this.props.availableDestinations.length < 2}
            onChange={this.props.onInputChange}
            options={this.props.availableDestinations}
            error={this.props.errors.destination}
            label="Destination"
            value={this.props.destination}
            id="destination"
          />
        </Sp>
        <FieldBtn
          data-testid="max-btn"
          tabIndex="-1"
          onClick={this.props.onMaxClick}
          float
        >
          MAX
        </FieldBtn>
        <TextInput
          data-testid="amount-field"
          autoFocus
          onChange={this.props.onInputChange}
          error={this.props.errors.metAmount}
          label="Amount (MET)"
          value={this.props.metAmount}
          id="metAmount"
        />

        <Sp mt={3}>
          <FeeEstimates feeError={this.props.feeError} fee={this.props.fee} />
        </Sp>

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
          Review Port
        </Btn>
      </BtnContainer>
    </form>
  )

  render() {
    return (
      <Drawer
        onRequestClose={this.props.onRequestClose}
        data-testid="port-drawer"
        isOpen={this.props.isOpen}
        title="Port Metronome"
      >
        <ConfirmationWizard
          renderConfirmation={this.renderConfirmation}
          onWizardSubmit={this.props.onSubmit}
          pendingTitle="Porting MET..."
          renderForm={this.renderForm}
          editLabel="Edit this port"
          validate={this.props.validate}
        />
      </Drawer>
    )
  }
}

export default withPortFormState(PortDrawer)
