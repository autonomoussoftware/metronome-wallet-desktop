import PropTypes from 'prop-types'
import React from 'react'

export default class AttestationDetails extends React.Component {
  static propTypes = {
    isAttestationValid: PropTypes.bool
  }

  render() {
    return (
      <div>
        A validator {this.props.isAttestationValid ? 'attested' : 'refuted'} an
        import
      </div>
    )
  }
}
