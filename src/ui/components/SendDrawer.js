import {
  LoadingBar,
  ItemFilter,
  CheckIcon,
  CloseIcon,
  Drawer,
  Flex,
  Sp
} from '../common'
import SendMTNForm from './SendMTNForm'
import SendETHForm from './SendETHForm'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import theme from '../theme'
import React from 'react'

const Tabs = styled.div`
  display: flex;
  flex-shrink: 0;
`

const Tab = styled.button`
  font: inherit;
  cursor: pointer;
  flex-grow: 1;
  border: none;
  border-bottom: 2px solid;
  border-bottom-color: ${p =>
    p.isActive ? p.theme.colors.primary : p.theme.colors.darkShade};
  transition: 0.5s;
  padding: 2.5rem;
  color: ${p => p.theme.colors.light};
  border-radius: 0;
  opacity: ${p => (p.isActive ? '1' : '0.5')};
  background: ${p =>
    p.isActive
      ? 'linear-gradient(253deg, rgba(66, 53, 119, 0.4), rgba(126, 97, 248, 0.1))'
      : 'transparent'};
  line-height: 2rem;
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: 1.6px;
  text-align: center;
  &:focus {
    outline: none;
  }
`

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

export default class SendDrawer extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  state = {
    status: 'init',
    error: null
  }

  render() {
    const { onRequestClose, isOpen } = this.props
    const { status, error } = this.state

    return (
      <Drawer
        onRequestClose={onRequestClose}
        isOpen={isOpen}
        title="Send Transaction"
      >
        {status === 'init' && (
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
                <Tabs>
                  <Tab
                    isActive={activeFilter === 'mtn'}
                    onClick={() => onFilterChange('mtn')}
                  >
                    MTN
                  </Tab>
                  <Tab
                    isActive={activeFilter === 'eth'}
                    onClick={() => onFilterChange('eth')}
                  >
                    ETH
                  </Tab>
                </Tabs>
                {filteredItems.map(i =>
                  React.createElement(i.component, { key: i.name })
                )}
              </React.Fragment>
            )}
          </ItemFilter>
        )}
        {status === 'pending' && (
          <Sp m={6}>
            <Title>Processing...</Title>
            <Sp mt={3}>
              <LoadingBar />
            </Sp>
          </Sp>
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
        {status === 'failure' && (
          <Sp my={19} mx={12}>
            <Flex.Column align="center">
              <CloseIcon size="4.8rem" color={theme.colors.danger} />
              <Sp my={2}>
                <Title>Error</Title>
              </Sp>
              <Message>{error}</Message>
            </Flex.Column>
          </Sp>
        )}
      </Drawer>
    )
  }
}
