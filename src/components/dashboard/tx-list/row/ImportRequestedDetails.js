import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Chain = styled.span`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
`

export default class ImportRequestedDetails extends React.Component {
  static propTypes = {
    importedFrom: PropTypes.string,
    isPending: PropTypes.bool.isRequired
  }

  render() {
    return this.props.isPending ? (
      <div>
        Pending import request from <Chain>{this.props.importedFrom}</Chain>{' '}
        blockchain
      </div>
    ) : (
      <div>
        Import from <Chain>{this.props.importedFrom}</Chain> blockchain
        requested
      </div>
    )
  }
}
