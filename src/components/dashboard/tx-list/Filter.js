import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`

const Tab = styled.button`
  font: inherit;
  line-height: 1.8rem;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  opacity: ${p => (p.isActive ? '1' : '0.5')};
  text-transform: uppercase;
  padding: 1.6rem 0.8rem;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  border-bottom: 2px solid ${p => (p.isActive ? 'white' : 'transparent')};
  margin-bottom: 1px;
  transition: 0.3s;
  &:focus {
    outline: none;
  }

  @media (min-width: 760px) {
    font-size: 1.4rem;
    padding: 1.6rem;
  }
`

export default class Filter extends React.Component {
  static propTypes = {
    onFilterChange: PropTypes.func.isRequired,
    activeFilter: PropTypes.oneOf([
      'converted',
      'received',
      'auction',
      'sent',
      ''
    ]).isRequired
  }

  render() {
    return (
      <Container>
        <Tab
          isActive={this.props.activeFilter === ''}
          onClick={() => this.props.onFilterChange('')}
        >
          All
        </Tab>
        <Tab
          isActive={this.props.activeFilter === 'sent'}
          onClick={() => this.props.onFilterChange('sent')}
        >
          Sent
        </Tab>
        <Tab
          isActive={this.props.activeFilter === 'received'}
          onClick={() => this.props.onFilterChange('received')}
        >
          Received
        </Tab>
        <Tab
          isActive={this.props.activeFilter === 'auction'}
          onClick={() => this.props.onFilterChange('auction')}
        >
          Auction
        </Tab>
        <Tab
          isActive={this.props.activeFilter === 'converted'}
          onClick={() => this.props.onFilterChange('converted')}
        >
          Converted
        </Tab>
      </Container>
    )
  }
}
