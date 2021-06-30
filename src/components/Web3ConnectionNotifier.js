import withConnectionState from 'metronome-wallet-ui-logic/src/hocs/withConnectionState'
import PropTypes from 'prop-types'
import React from 'react'

import { ToastsContext } from '../components/toasts'

class Web3ConnectionNotifier extends React.Component {
  static propTypes = {
    isConnected: PropTypes.bool,
    chainName: PropTypes.string,
  }

  static contextType = ToastsContext

  componentDidUpdate(prevProps) {
    // Avoid launching toasts when changing chains
    if (prevProps.chainName !== this.props.chainName) return

    // Only launch success toast when recovering from a disconnection
    if (prevProps.isConnected === false && this.props.isConnected === true) {
      this.context.toast(
        'success',
        `Reconnected to ${this.props.chainName} network`
      )
    }
    // Only launch error toast if disconnected on init or after being connected
    if (
      (prevProps.isConnected === true || prevProps.isConnected === null) &&
      this.props.isConnected === false
    ) {
      this.context.toast(
        'error',
        `Disconnected from ${this.props.chainName} network`,
        { autoClose: 15000 }
      )
    }
  }

  render() {
    return null
  }
}

// We have to do this indirection because React 16.7.0 doesn't support using
// both contextType and Redux context at the same time
export default withConnectionState(({ isConnected, chainName }) => (
  <Web3ConnectionNotifier isConnected={isConnected} chainName={chainName} />
))
