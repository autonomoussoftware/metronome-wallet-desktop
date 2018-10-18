import withSendDrawerState from 'metronome-wallet-ui-logic/src/hocs/withSendDrawerState'
import PropTypes from 'prop-types'
import React from 'react'

import { Drawer, Tabs } from '../common'
import SendMETForm from './SendMETForm'
import SendETHForm from './SendETHForm'

class SendDrawer extends React.Component {
  static propTypes = {
    sendMetDisabledReason: PropTypes.string,
    sendMetDisabled: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  state = { activeTab: 'eth' }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && prevProps.isOpen !== this.props.isOpen) {
      this.setState({ activeTab: 'eth' })
    }
  }

  onTabChange = activeTab => this.setState({ activeTab })

  render() {
    const tabs = (
      <Tabs
        onClick={this.onTabChange}
        active={this.state.activeTab}
        items={[
          {
            id: 'met',
            label: 'MET',
            'data-rh': this.props.sendMetDisabledReason,
            disabled: this.props.sendMetDisabled
          },
          { id: 'eth', label: 'ETH' }
        ]}
      />
    )

    return (
      <Drawer
        onRequestClose={this.props.onRequestClose}
        data-testid="send-drawer"
        isOpen={this.props.isOpen}
        title="Send Transaction"
      >
        {this.state.activeTab === 'eth' && <SendETHForm tabs={tabs} />}
        {this.state.activeTab === 'met' && <SendMETForm tabs={tabs} />}
      </Drawer>
    )
  }
}

export default withSendDrawerState(SendDrawer)
