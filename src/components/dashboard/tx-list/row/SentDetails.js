import FilteredMessage from 'metronome-wallet-ui-logic/src/components/FilteredMessage'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Address = styled.span`
  letter-spacing: normal;
  line-height: 1.6rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: initial;

  @media (min-width: 800px) {
    font-size: 1.3rem;
  }
`

export default class SentDetails extends React.Component {
  static propTypes = {
    isCancelApproval: PropTypes.bool,
    isApproval: PropTypes.bool,
    isPending: PropTypes.bool.isRequired,
    to: PropTypes.string.isRequired
  }

  render() {
    return (
      <div>
        {this.props.isPending ? (
          this.props.isApproval ? (
            'Pending allowance for'
          ) : this.props.isCancelApproval ? (
            'Pending cancel allowance for'
          ) : (
            'Pending to'
          )
        ) : this.props.isApproval ? (
          'Allowance set for'
        ) : this.props.isCancelApproval ? (
          'Allowance cancelled for'
        ) : (
          <React.Fragment>
            Sent to{' '}
            <Address>
              <FilteredMessage>{this.props.to}</FilteredMessage>
            </Address>
          </React.Fragment>
        )}
      </div>
    )
  }
}
