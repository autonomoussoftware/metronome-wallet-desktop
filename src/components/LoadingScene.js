import * as selectors from '../selectors'
import { LoadingBar } from './common'
import ChecklistItem from './common/ChecklistItem'
import { connect } from 'react-redux'
import AltLayout from './AltLayout'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Checklist = styled.div`
  margin-top: 3.2rem;
`

class LoadingScene extends React.Component {
  static propTypes = {
    hasBlockHeight: PropTypes.bool.isRequired,
    hasEthBalance: PropTypes.bool.isRequired,
    hasMetBalance: PropTypes.bool.isRequired,
    hasMetStatus: PropTypes.bool.isRequired,
    hasEthRate: PropTypes.bool.isRequired
  }

  render() {
    return (
      <AltLayout title="Contacting Network..." data-testid="loading-scene">
        <LoadingBar />
        <Checklist>
          <ChecklistItem
            isActive={this.props.hasBlockHeight}
            text="Latest block"
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
          <ChecklistItem
            isActive={this.props.hasMetStatus}
            text="MET token status"
          />
        </Checklist>
      </AltLayout>
    )
  }
}

const mapStateToProps = state => ({
  hasBlockHeight: selectors.getBlockHeight(state) !== null,
  hasEthBalance: selectors.getActiveWalletEthBalance(state) !== null,
  hasMetBalance: selectors.getActiveWalletMtnBalance(state) !== null,
  hasMetStatus: selectors.getMetTransferAllowed(state) !== null,
  hasEthRate: selectors.getEthRate(state) !== null
})

export default connect(mapStateToProps)(LoadingScene)
