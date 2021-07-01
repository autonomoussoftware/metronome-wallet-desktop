import withSendDrawerState from 'metronome-wallet-ui-logic/src/hocs/withSendDrawerState'
import PropTypes from 'prop-types'
import React from 'react'

import { Drawer, Tabs } from '../common'
import SendCoinForm from './SendCoinForm'
import SendMETForm from './SendMETForm'

class SendDrawer extends React.Component {
  static propTypes = {
    sendMetDisabledReason: PropTypes.string,
    sendMetDisabled: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    coinSymbol: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  state = { activeTab: 'coin' }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && prevProps.isOpen !== this.props.isOpen) {
      this.setState({ activeTab: 'coin' })
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
          { id: 'coin', label: this.props.coinSymbol }
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
        {this.state.activeTab === 'coin' && <SendCoinForm tabs={tabs} />}
        {this.state.activeTab === 'met' && <SendMETForm tabs={tabs} />}
      </Drawer>
    )
  }
}

export default withSendDrawerState(SendDrawer)
