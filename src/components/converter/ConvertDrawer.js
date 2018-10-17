import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import ConvertETHtoMETForm from './ConvertETHtoMETForm'
import ConvertMETtoETHForm from './ConvertMETtoETHForm'
import { Drawer, Tabs } from '../common'

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
            id: 'eth',
            label: (
              <React.Fragment>
                ETH
                <Arrow>&rarr;</Arrow>
                MET
              </React.Fragment>
            )
          },
          {
            id: 'met',
            label: (
              <React.Fragment>
                MET
                <Arrow>&rarr;</Arrow>
                ETH
              </React.Fragment>
            )
          }
        ]}
      />
    )

    return (
      <Drawer
        onRequestClose={this.props.onRequestClose}
        data-testid="convert-drawer"
        isOpen={this.props.isOpen}
        title="Converter"
      >
        {this.state.activeTab === 'eth' && <ConvertETHtoMETForm tabs={tabs} />}
        {this.state.activeTab === 'met' && <ConvertMETtoETHForm tabs={tabs} />}
      </Drawer>
    )
  }
}
