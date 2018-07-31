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
  padding-left: 4.8rem;
`

// Time to wait before updating checklist status (in ms)
// The idea is to prevent fast-loading checklists which would look like a glitch
const MIN_CADENCE = 200

// Time to wait before exiting the loading screen (in ms)
const ON_COMPLETE_DELAY = 20

class LoadingScene extends React.Component {
  static propTypes = {
    hasBlockHeight: PropTypes.bool.isRequired,
    hasEthBalance: PropTypes.bool.isRequired,
    hasMetBalance: PropTypes.bool.isRequired,
    hasEthRate: PropTypes.bool.isRequired,
    onComplete: PropTypes.func.isRequired
  }

  state = {
    hasBlockHeight: false,
    hasEthBalance: false,
    hasMetBalance: false,
    hasEthRate: false
  }

  checkFinished = () => {
    const {
      hasBlockHeight,
      hasEthBalance,
      hasMetBalance,
      hasEthRate
    } = this.state

    if (hasBlockHeight && hasEthBalance && hasMetBalance && hasEthRate) {
      clearInterval(this.interval)
      setTimeout(this.props.onComplete, ON_COMPLETE_DELAY)
    }
  }

  // eslint-disable-next-line
  checkTasks = () => {
    const {
      hasBlockHeight,
      hasEthBalance,
      hasMetBalance,
      hasEthRate
    } = this.state

    if (this.props.hasBlockHeight && !hasBlockHeight) {
      return this.setState({ hasBlockHeight: true }, this.checkFinished)
    }
    if (this.props.hasEthBalance && !hasEthBalance) {
      return this.setState({ hasEthBalance: true }, this.checkFinished)
    }
    if (this.props.hasMetBalance && !hasMetBalance) {
      return this.setState({ hasMetBalance: true }, this.checkFinished)
    }
    if (this.props.hasEthRate && !hasEthRate) {
      return this.setState({ hasEthRate: true }, this.checkFinished)
    }
  }

  componentDidMount() {
    this.interval = setInterval(this.checkTasks, MIN_CADENCE)
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval)
  }

  render() {
    return (
      <AltLayout title="Gathering Information..." data-testid="loading-scene">
        <LoadingBar />
        <Checklist>
          <ChecklistItem
            isActive={this.state.hasBlockHeight}
            text="Blockchain status"
          />
          <ChecklistItem
            isActive={this.state.hasEthRate}
            text="ETH exchange data"
          />
          <ChecklistItem
            isActive={this.state.hasEthBalance}
            text="ETH balance"
          />
          <ChecklistItem
            isActive={this.state.hasMetBalance}
            text="MET balance"
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
  hasEthRate: selectors.getEthRate(state) !== null
})

const mapDispatchToProps = dispatch => ({
  onComplete: () => dispatch({ type: 'required-data-gathered' })
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadingScene)
