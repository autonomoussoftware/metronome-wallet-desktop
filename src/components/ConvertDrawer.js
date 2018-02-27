import { ItemFilter, CheckIcon, Drawer, Tabs, Flex, Sp } from './common'
import ConvertETHtoMTNForm from './ConvertETHtoMTNForm'
import ConvertMTNtoETHForm from './ConvertMTNtoETHForm'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import theme from '../theme'
import React from 'react'

const Title = styled.div`
  line-height: 3rem;
  font-size: 2.4rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const Message = styled.div`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

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

  static initialState = {
    transactionHash: null,
    status: 'init',
    error: null
  }

  state = ConvertDrawer.initialState

  componentWillReceiveProps(newProps) {
    if (newProps.isOpen && newProps.isOpen !== this.props.isOpen) {
      this.setState(ConvertDrawer.initialState)
    }
  }

  onSuccess = ({ hash: transactionHash }) => {
    this.setState({ status: 'success', transactionHash })
  }

  render() {
    const { onRequestClose, isOpen } = this.props
    const { status } = this.state

    return (
      <Drawer onRequestClose={onRequestClose} isOpen={isOpen} title="Converter">
        {status === 'init' && (
          <ItemFilter
            defaultFilter="ethToMtn"
            extractValue={({ name }) => name}
            items={[
              { name: 'ethToMtn', component: ConvertETHtoMTNForm },
              { name: 'mtnToEth', component: ConvertMTNtoETHForm }
            ]}
          >
            {({ filteredItems, onFilterChange, activeFilter }) => (
              <React.Fragment>
                <Tabs
                  onClick={onFilterChange}
                  active={activeFilter}
                  items={[
                    {
                      id: 'ethToMtn',
                      label: (
                        <React.Fragment>
                          ETH<Arrow>&rarr;</Arrow>MET
                        </React.Fragment>
                      )
                    },
                    {
                      id: 'mtnToEth',
                      label: (
                        <React.Fragment>
                          MET<Arrow>&rarr;</Arrow>ETH
                        </React.Fragment>
                      )
                    }
                  ]}
                />
                {filteredItems.map(i =>
                  React.createElement(i.component, {
                    onSuccess: this.onSuccess,
                    key: i.name
                  })
                )}
              </React.Fragment>
            )}
          </ItemFilter>
        )}
        {status === 'success' && (
          <Sp my={19} mx={12}>
            <Flex.Column align="center">
              <CheckIcon color={theme.colors.success} />
              <Sp my={2}>
                <Title>Sent!</Title>
              </Sp>
              <Message>
                You can view the status of this transaction in the transaction
                list.
              </Message>
            </Flex.Column>
          </Sp>
        )}
      </Drawer>
    )
  }
}
