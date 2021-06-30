import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Currency = styled.span`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
`

export default class ConvertedDetails extends React.Component {
  static propTypes = {
    convertedFrom: PropTypes.string,
    coinSymbol: PropTypes.string.isRequired,
    isPending: PropTypes.bool.isRequired,
  }

  render() {
    return (
      <div>
        {this.props.isPending && 'Pending conversion from '}
        <Currency>
          {this.props.convertedFrom === 'coin' ? this.props.coinSymbol : 'MET'}
        </Currency>
        {this.props.isPending ? ' to ' : ' converted to '}
        <Currency>
          {this.props.convertedFrom === 'coin' ? 'MET' : this.props.coinSymbol}
        </Currency>
      </div>
    )
  }
}
