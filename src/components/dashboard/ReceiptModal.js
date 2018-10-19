import PropTypes from 'prop-types'
import React from 'react'

import { Modal } from '../common'
import Receipt from '../common/receipt/Receipt'

export default class ReceiptModal extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    hash: PropTypes.string
  }

  render() {
    if (!this.props.hash) return null

    return (
      <Modal
        shouldReturnFocusAfterClose={false}
        onRequestClose={this.props.onRequestClose}
        isOpen={this.props.isOpen}
      >
        <Receipt hash={this.props.hash} />
      </Modal>
    )
  }
}
