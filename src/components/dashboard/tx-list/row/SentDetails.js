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
    CONVERTER_ADDR: PropTypes.string.isRequired,
    MET_TOKEN_ADDR: PropTypes.string.isRequired,
    isApproval: PropTypes.bool,
    isPending: PropTypes.bool.isRequired,
    to: PropTypes.string.isRequired
  }

  render() {
    return (
      <div>
        {this.props.isPending
          ? this.props.isApproval
            ? 'Pending allowance for'
            : this.props.isCancelApproval
              ? 'Pending cancel allowance for'
              : 'Pending to'
          : this.props.isApproval
            ? 'Allowance set for'
            : this.props.isCancelApproval
              ? 'Allowance cancelled for'
              : 'Sent to'}{' '}
        {this.props.to === this.props.MET_TOKEN_ADDR ? (
          'MET TOKEN CONTRACT'
        ) : this.props.to === this.props.CONVERTER_ADDR ? (
          'CONVERTER CONTRACT'
        ) : (
          <Address>{this.props.to}</Address>
        )}
      </div>
    )
  }
}
