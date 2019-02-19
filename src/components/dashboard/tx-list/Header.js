import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import ScanIndicator from './ScanIndicator'
import { Flex } from '../../common'
import Filter from './Filter'

const Container = styled.div`
  position: sticky;
  background: ${p => p.theme.colors.primary};
  top: 4.1rem;
  left: 0;
  right: 0;
  z-index: 1;
  margin: 0 -4.8rem;
  padding: 0 4.8rem;

  @media (min-width: 1140px) {
    top: 6.8rem;
    display: flex;
    align-items: baseline;
  }
`

const Title = styled.div`
  line-height: 2.5rem;
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin-bottom: 2px;
  margin-right: 2.4rem;

  @media (min-width: 1140px) {
    margin-right: 0.8rem;
  }

  @media (min-width: 1200px) {
    margin-right: 1.6rem;
  }
`

export default class Header extends React.Component {
  static propTypes = {
    hasTransactions: PropTypes.bool.isRequired,
    onWalletRefresh: PropTypes.func.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    activeFilter: PropTypes.string.isRequired,
    onTitleClick: PropTypes.func.isRequired,
    syncStatus: PropTypes.oneOf(['up-to-date', 'syncing', 'failed']).isRequired
  }

  render() {
    return (
      <Container>
        <Flex.Row grow="1">
          <Title onClick={this.props.onTitleClick}>Transactions</Title>
          {(this.props.hasTransactions ||
            this.props.syncStatus !== 'syncing') && (
            <ScanIndicator
              onWalletRefresh={this.props.onWalletRefresh}
              syncStatus={this.props.syncStatus}
            />
          )}
        </Flex.Row>
        <Filter
          onFilterChange={this.props.onFilterChange}
          activeFilter={this.props.activeFilter}
        />
      </Container>
    )
  }
}
