import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import FailedImportsBadge from './FailedImportsBadge'
import ConverterIcon from '../icons/ConverterIcon'
import AuctionIcon from '../icons/AuctionIcon'
import WalletIcon from '../icons/WalletIcon'
import PortIcon from '../icons/PortIcon'

const Button = styled(NavLink)`
  display: flex;
  min-height: 7.1rem;
  align-items: center;
  text-decoration: none;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: ${p => p.theme.colors.light};
  padding: 1.6rem;
  border-bottom: 1px solid ${p => p.theme.colors.darkShade};
  border-top: 1px solid transparent;

  &:focus {
    outline: none;
  }

  &:hover:not(.active) {
    background-color: ${p => p.theme.colors.lightShade};
  }

  &:first-child {
    border-top: 1px solid ${p => p.theme.colors.darkShade};
  }

  &.active {
    pointer-events: none;
    border-bottom: 2px solid ${p => p.theme.colors.primary};
    background-image: linear-gradient(
      250deg,
      rgba(66, 53, 119, 0.4),
      rgba(126, 97, 248, 0.1)
    );
  }
`

const IconWrapper = styled.div`
  margin-right: 1.6rem;
  margin-left: 0.3rem;
  opacity: 0.5;

  ${Button}.active & {
    opacity: 1;
  }
`

const Label = styled.span`
  opacity: 0;
  flex-grow: 1;

  ${({ parent }) => parent}:hover & {
    opacity: 0.5;
  }

  ${({ parent }) => parent}:hover ${Button}.active & {
    opacity: 1;
  }

  @media (min-width: 800px) {
    opacity: 0.5;

    ${Button}.active & {
      opacity: 1;
    }
  }
`

export default class PrimaryNav extends React.Component {
  static propTypes = {
    parent: PropTypes.object.isRequired
  }

  render() {
    return (
      <React.Fragment>
        <Button
          activeClassName="active"
          data-testid="wallets-nav-btn"
          to="/wallets"
        >
          <IconWrapper>
            <WalletIcon />
          </IconWrapper>
          <Label parent={this.props.parent}>Wallet</Label>
        </Button>
        <Button
          activeClassName="active"
          data-testid="auction-nav-btn"
          to="/auction"
        >
          <IconWrapper>
            <AuctionIcon />
          </IconWrapper>
          <Label parent={this.props.parent}>Auction</Label>
        </Button>
        <Button
          activeClassName="active"
          data-testid="converter-nav-btn"
          to="/converter"
        >
          <IconWrapper>
            <ConverterIcon />
          </IconWrapper>
          <Label parent={this.props.parent}>Converter</Label>
        </Button>
        <Button activeClassName="active" data-testid="port-nav-btn" to="/port">
          <IconWrapper>
            <PortIcon />
          </IconWrapper>
          <Label parent={this.props.parent}>Port</Label>
          <FailedImportsBadge parent={this.props.parent} />
        </Button>
      </React.Fragment>
    )
  }
}
