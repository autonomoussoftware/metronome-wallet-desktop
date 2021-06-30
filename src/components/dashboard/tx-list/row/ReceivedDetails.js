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

export default class ReceivedDetails extends React.Component {
  static propTypes = {
    isPending: PropTypes.bool.isRequired,
    from: PropTypes.string.isRequired,
  }

  render() {
    return (
      <div>
        {this.props.isPending ? 'Pending' : 'Received'} from{' '}
        <Address>
          <FilteredMessage>{this.props.from}</FilteredMessage>
        </Address>
      </div>
    )
  }
}
