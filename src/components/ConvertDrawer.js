import ConvertETHtoMETForm from './ConvertETHtoMETForm'
import ConvertMETtoETHForm from './ConvertMETtoETHForm'
import { Drawer, Tabs } from './common'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Arrow = styled.span`
  color: ${p => p.theme.colors.primary};
  position: relative;
  top: -7px;
  margin: 0 8px;
  transform: scale3d(1.5, 2, 1);
  display: inline-block;
`

export default class ConvertDrawer extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    defaultTab: PropTypes.oneOf(['ethToMet', 'metToEth']),
    isOpen: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props)
    this.state = this.getInitialState(props)
  }

  getInitialState = props => ({
    activeTab: props.defaultTab || 'ethToMet'
  })

  componentWillReceiveProps(newProps) {
    if (newProps.isOpen && newProps.isOpen !== this.props.isOpen) {
      this.setState(this.getInitialState(newProps))
    }
  }

  onTabChange = activeTab => this.setState({ activeTab })

  render() {
    const { onRequestClose, isOpen } = this.props
    const { activeTab } = this.state

    const tabs = (
      <Tabs
        onClick={this.onTabChange}
        active={activeTab}
        items={[
          {
            id: 'ethToMet',
            label: (
              <React.Fragment>
                ETH<Arrow>&rarr;</Arrow>MET
              </React.Fragment>
            )
          },
          {
            id: 'metToEth',
            label: (
              <React.Fragment>
                MET<Arrow>&rarr;</Arrow>ETH
              </React.Fragment>
            )
          }
        ]}
      />
    )

    return (
      <Drawer
        onRequestClose={onRequestClose}
        data-testid="convert-drawer"
        isOpen={isOpen}
        title="Converter"
      >
        {activeTab === 'ethToMet' && <ConvertETHtoMETForm tabs={tabs} />}
        {activeTab === 'metToEth' && <ConvertMETtoETHForm tabs={tabs} />}
      </Drawer>
    )
  }
}
