import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Chain = styled.span`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
`

export default class ImportedDetails extends React.Component {
  static propTypes = {
    importedFrom: PropTypes.string,
    isPending: PropTypes.bool.isRequired
  }

  render() {
    return (
      <div>
        {this.props.isPending ? 'Pending import from ' : 'Imported from '}
        <Chain>{this.props.importedFrom}</Chain> blockchain
      </div>
    )
  }
}
