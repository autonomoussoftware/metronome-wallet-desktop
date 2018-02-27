import { ItemFilter, CheckIcon, Drawer, Flex, Tabs, Sp } from './common'
import * as selectors from '../selectors'
import SendMTNForm from './SendMTNForm'
import SendETHForm from './SendETHForm'
import { connect } from 'react-redux'
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

class SendDrawer extends React.Component {
  static propTypes = {
    isInitialAuction: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  static initialState = {
    transactionHash: null,
    status: 'init',
    error: null
  }

  state = SendDrawer.initialState

  componentWillReceiveProps(newProps) {
    if (newProps.isOpen && newProps.isOpen !== this.props.isOpen) {
      this.setState(SendDrawer.initialState)
    }
  }

  onSuccess = ({ hash: transactionHash }) => {
    this.setState({ status: 'success', transactionHash })
  }

  render() {
    const { isInitialAuction, onRequestClose, isOpen } = this.props
    const { status } = this.state

    return (
      <Drawer
        onRequestClose={onRequestClose}
        isOpen={isOpen}
        title="Send Transaction"
      >
        {status === 'init' &&
          (isInitialAuction ? (
            <SendETHForm onSuccess={this.onSuccess} />
          ) : (
            <ItemFilter
              defaultFilter="mtn"
              extractValue={({ name }) => name}
              items={[
                { name: 'mtn', component: SendMTNForm },
                { name: 'eth', component: SendETHForm }
              ]}
            >
              {({ filteredItems, onFilterChange, activeFilter }) => (
                <React.Fragment>
                  <Tabs
                    onClick={onFilterChange}
                    active={activeFilter}
                    items={[
                      { id: 'mtn', label: 'MET' },
                      { id: 'eth', label: 'ETH' }
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
          ))}
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

const mapStateToProps = state => ({
  isInitialAuction: selectors.getCurrentAuction(state) === '0'
})

export default connect(mapStateToProps)(SendDrawer)
