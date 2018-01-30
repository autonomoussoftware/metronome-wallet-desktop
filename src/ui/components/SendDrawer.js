import SendMTNForm from './SendMTNForm';
import ItemFilter from './ItemFilter';
import { Drawer } from '../common';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import React from 'react';

const Tabs = styled.div`
  display: flex;
  flex-shrink: 0;
`;

const Tab = styled.button`
  font: inherit;
  cursor: pointer;
  flex-grow: 1;
  border: none;
  border-bottom: 2px solid;
  border-bottom-color: ${p =>
    p.isActive ? p.theme.colors.primary : p.theme.colors.shade};
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
`;

export default class SendDrawer extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  render() {
    const { onRequestClose, isOpen } = this.props;

    return (
      <Drawer
        onRequestClose={onRequestClose}
        isOpen={isOpen}
        title="Send Transaction"
      >
        <ItemFilter
          defaultFilter="mtn"
          extractValue={({ name }) => name}
          items={[
            { name: 'mtn', component: SendMTNForm },
            { name: 'eth', component: SendMTNForm }
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
      </Drawer>
    );
  }
}
