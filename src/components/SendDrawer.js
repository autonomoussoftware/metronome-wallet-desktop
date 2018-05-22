import { Drawer, Tabs } from './common'
import * as selectors from '../selectors'
import SendMETForm from './SendMETForm'
import SendETHForm from './SendETHForm'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React from 'react'

class SendDrawer extends React.Component {
  static propTypes = {
    sendMetFeatureStatus: PropTypes.oneOf([
      'in-initial-auction',
      'transfer-disabled',
      'no-funds',
      'offline',
      'ok'
    ]).isRequired,
    onRequestClose: PropTypes.func.isRequired,
    defaultTab: PropTypes.oneOf(['eth', 'met']),
    isOpen: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props)
    this.state = this.getInitialState(props)
  }

  getInitialState = props => ({
    activeTab:
      props.sendMetFeatureStatus !== 'ok'
        ? 'eth'
        : props.defaultTab === 'eth' ? 'eth' : 'met'
  })

  componentWillReceiveProps(newProps) {
    if (newProps.isOpen && newProps.isOpen !== this.props.isOpen) {
      this.setState(this.getInitialState(newProps))
    }
  }

  onTabChange = activeTab => this.setState({ activeTab })

  render() {
    const { sendMetFeatureStatus, onRequestClose, isOpen } = this.props
    const { activeTab } = this.state

    const tabs = (
      <Tabs
        onClick={this.onTabChange}
        active={this.state.activeTab}
        items={[
          {
            id: 'met',
            label: 'MET',
            disabled: sendMetFeatureStatus !== 'ok',
            'data-rh':
              sendMetFeatureStatus === 'in-initial-auction'
                ? 'MET transactions are disabled during Initial Auction'
                : sendMetFeatureStatus === 'transfer-disabled'
                  ? 'MET transactions not enabled yet'
                  : sendMetFeatureStatus === 'no-funds'
                    ? 'You need some MET to send'
                    : sendMetFeatureStatus === 'offline'
                      ? "Can't send while offline"
                      : null
          },
          { id: 'eth', label: 'ETH' }
        ]}
      />
    )

    return (
      <Drawer
        onRequestClose={onRequestClose}
        data-testid="send-drawer"
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
  sendMetFeatureStatus: selectors.sendMetFeatureStatus(state)
})

export default connect(mapStateToProps)(SendDrawer)
