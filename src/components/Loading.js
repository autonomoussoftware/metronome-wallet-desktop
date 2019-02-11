import withLoadingState from 'metronome-wallet-ui-logic/src/hocs/withLoadingState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { LoadingBar, AltLayout, Flex } from './common'
import ChecklistItem from './common/ChecklistItem'

const ChecklistContainer = styled(Flex.Row)`
  margin: 4rem -20rem;
`

const Title = styled.div`
  display: none; // remove this line when reinserting ChainSelector
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 1.6px;
  opacity: 0.5;
  margin-bottom: 0.8rem;
  padding-left: 8rem;
`

const Checklist = styled.div`
  // padding-left: 4.8rem; // add this line when reinserting ChainSelector
`

class Loading extends React.Component {
  static propTypes = {
    chainsStatus: PropTypes.objectOf(
      PropTypes.shape({
        hasBlockHeight: PropTypes.bool,
        hasCoinBalance: PropTypes.bool,
        hasMetBalance: PropTypes.bool,
        hasCoinRate: PropTypes.bool,
        displayName: PropTypes.string.isRequired,
        symbol: PropTypes.string.isRequired
      })
    ).isRequired
  }

  render() {
    return (
      <AltLayout title="Gathering Information..." data-testid="loading-scene">
        <LoadingBar />
        <ChecklistContainer justify="center">
          {Object.keys(this.props.chainsStatus).map(chainName => (
            <div key={chainName}>
              <Title>{this.props.chainsStatus[chainName].displayName}</Title>
              <Checklist>
                <ChecklistItem
                  isActive={this.props.chainsStatus[chainName].hasBlockHeight}
                  text="Blockchain status"
                />
                <ChecklistItem
                  isActive={this.props.chainsStatus[chainName].hasCoinRate}
                  text={`${
                    this.props.chainsStatus[chainName].symbol
                  } exchange data`}
                />
                <ChecklistItem
                  isActive={this.props.chainsStatus[chainName].hasCoinBalance}
                  text={`${this.props.chainsStatus[chainName].symbol} balance`}
                />
                <ChecklistItem
                  isActive={this.props.chainsStatus[chainName].hasMetBalance}
                  text="MET balance"
                />
              </Checklist>
            </div>
          ))}
        </ChecklistContainer>
      </AltLayout>
    )
  }
}

export default withLoadingState(Loading)
