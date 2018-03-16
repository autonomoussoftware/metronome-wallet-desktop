import { Drawer, Tabs } from './common'
import * as selectors from '../selectors'
import SendMETForm from './SendMETForm'
import SendETHForm from './SendETHForm'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React from 'react'

class SendDrawer extends React.Component {
  static propTypes = {
    isInitialAuction: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  initialState = {
    activeTab: this.props.isInitialAuction ? 'eth' : 'met'
  }

  state = this.initialState

  componentWillReceiveProps(newProps) {
    if (newProps.isOpen && newProps.isOpen !== this.props.isOpen) {
      this.setState(this.initialState)
    }
  }

  onTabChange = activeTab => this.setState({ activeTab })

  render() {
    const { isInitialAuction, onRequestClose, isOpen } = this.props
    const { activeTab } = this.state

    const tabs = (
      <Tabs
        onClick={this.onTabChange}
        active={this.state.activeTab}
        items={[
          {
            id: 'met',
            label: 'MET',
            disabled: isInitialAuction,
            'data-rh': isInitialAuction
              ? 'MET transactions are disabled during Initial Auction'
              : null
          },
          { id: 'eth', label: 'ETH' }
        ]}
      />
    )

    return (
      <Drawer
        onRequestClose={onRequestClose}
        isOpen={isOpen}
        title="Send Transaction"
      >
        {activeTab === 'met' && <SendMETForm tabs={tabs} />}
        {activeTab === 'eth' && <SendETHForm tabs={tabs} />}
      </Drawer>
    )
  }
}

const mapStateToProps = state => ({
  isInitialAuction: selectors.getCurrentAuction(state) === '0'
})

export default connect(mapStateToProps)(SendDrawer)
