import withReceiptState from 'metronome-wallet-ui-logic/src/hocs/withReceiptState'
import PropTypes from 'prop-types'
import React from 'react'

import Modal, { HeaderButton } from '../common/Modal'
import { ToastsContext } from '../toasts'
import Receipt from '../common/receipt/Receipt'

class ReceiptModal extends React.Component {
  static propTypes = {
    onRefreshRequest: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    refreshStatus: PropTypes.oneOf(['init', 'pending', 'success', 'failure'])
      .isRequired,
    isOpen: PropTypes.bool.isRequired,
    hash: PropTypes.string,
  }

  static contextType = ToastsContext

  componentDidUpdate(prevProps) {
    if (
      this.props.refreshStatus !== prevProps.refreshStatus &&
      this.props.refreshStatus === 'failure'
    ) {
      this.context.toast('error', 'Could not refresh')
    }
  }

  render() {
    if (!this.props.hash) return null

    return (
      <Modal
        shouldReturnFocusAfterClose={false}
        onRequestClose={this.props.onRequestClose}
        headerChildren={
          <HeaderButton
            disabled={this.props.refreshStatus === 'pending'}
            onClick={this.props.onRefreshRequest}
          >
            {this.props.refreshStatus === 'pending' ? 'Syncing...' : 'Refresh'}
          </HeaderButton>
        }
        isOpen={this.props.isOpen}
        title="Receipt"
      >
        <Receipt {...this.props} />
      </Modal>
    )
  }
}

export default withReceiptState(ReceiptModal)
