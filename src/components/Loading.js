import withLoadingState from 'metronome-wallet-ui-logic/src/hocs/withLoadingState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { LoadingBar } from './common'
import ChecklistItem from './common/ChecklistItem'
import AltLayout from './AltLayout'

const Checklist = styled.div`
  margin-top: 3.2rem;
  padding-left: 4.8rem;
`

class Loading extends React.Component {
  static propTypes = {
    hasBlockHeight: PropTypes.bool.isRequired,
    hasEthBalance: PropTypes.bool.isRequired,
    hasMetBalance: PropTypes.bool.isRequired,
    hasEthRate: PropTypes.bool.isRequired
  }

  render() {
    return (
      <AltLayout title="Gathering Information..." data-testid="loading-scene">
        <LoadingBar />
        <Checklist>
          <ChecklistItem
            isActive={this.props.hasBlockHeight}
            text="Blockchain status"
          />
          <ChecklistItem
            isActive={this.props.hasEthRate}
            text="ETH exchange data"
          />
          <ChecklistItem
            isActive={this.props.hasEthBalance}
            text="ETH balance"
          />
          <ChecklistItem
            isActive={this.props.hasMetBalance}
            text="MET balance"
          />
        </Checklist>
      </AltLayout>
    )
  }
}

export default withLoadingState(Loading)
