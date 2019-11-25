import withConnectionState from 'metronome-wallet-ui-logic/src/hocs/withConnectionState'
import PropTypes from 'prop-types'
import React from 'react'

import { ToastsContext } from './toasts'

class ConnectionNotifier extends React.Component {
  static propTypes = {
    connections: PropTypes.objectOf(PropTypes.bool),
    chainName: PropTypes.string
  }

  static contextType = ToastsContext

  componentDidUpdate(prevProps) {
    // Avoid launching toasts when switching chains
    if (prevProps.chainName !== this.props.chainName) return

    if (this.props.connections === null) return

    Object.keys(this.props.connections).forEach(name => {
      // Only launch success toast when recovering from a disconnection
      if (
        prevProps.connections !== null &&
        prevProps.connections[name] === false &&
        this.props.connections[name] === true
      ) {
        this.context.toast('success', `${name} reestablished`)
      }
      // Only launch error toast if disconnected on init or after being connected
      if (
        (prevProps.connections[name] === true ||
          prevProps.connections[name] === null) &&
        this.props.connections[name] === false
      ) {
        this.context.toast('error', `${name} lost`, { autoClose: 15000 })
      }
    })
  }

  render() {
    return null
  }
}

// We have to do this indirection because React 16.7.0 doesn't support using
// both contextType and Redux context at the same time
export default withConnectionState(({ chainName, connections }) => (
  <ConnectionNotifier chainName={chainName} connections={connections} />
))
