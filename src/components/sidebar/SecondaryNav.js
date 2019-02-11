import { withClient } from 'metronome-wallet-ui-logic/src/hocs/clientContext'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { BaseBtn } from '../common'
import CogIcon from '../icons/CogIcon'

const IconContainer = styled.div`
  padding: 1.2rem 0 1.6rem 1.9rem;
  display: block;

  @media (min-height: 650px) {
    padding-top: 5.2rem;
  }

  @media (min-width: 800px) {
    display: none;
  }

  & svg {
    opacity: 0.5;
    transition: transform 0.3s;
    transform: rotate(0deg);
    transform-origin: center center;
  }

  ${({ parent }) => parent}:hover & svg {
    opacity: 1;
    transform: rotate(-90deg);
  }
`

const Button = styled(NavLink)`
  cursor: pointer;
  display: block;
  text-decoration: none;
  color: ${p => p.theme.colors.light};
  padding: 0.8rem 1.6rem;
  line-height: 2rem;
  opacity: 0;
  transition: all 600ms, opacity 200ms, transform 800ms;
  position: relative;

  &[disabled] {
    pointer-events: none;
  }

  &:focus {
    outline: none;
  }

  &.active {
    pointer-events: none;
    padding-left: 3.2rem;
  }

  &:before {
    transition: 0.4s;
    transition-delay: 0.2s;
    opacity: 0;
    content: '';
    display: block;
    background-color: ${p => p.theme.colors.primary};
    border-radius: 100%;
    position: absolute;
    top: 50%;
    margin-top: -2px;
    left: 1.6rem;
  }

  &.active:before {
    opacity: 1;
    width: 8px;
    height: 8px;
  }

  &:nth-child(1) {
    transform: translateY(9.6rem);
  }

  &:nth-child(2) {
    transform: translateY(4rem);
  }

  ${({ parent }) => parent}:hover & {
    transform: translateY(0);
    opacity: 0.5;
    transition: all 600ms, opacity 400ms, transform 400ms;
    transition-delay: 0s, 100ms, 0s;

    &:active,
    &:hover,
    &:focus,
    &.active {
      opacity: 1;
    }
  }

  @media (min-width: 800px) {
    ${({ parent }) => parent} & {
      transform: translateY(0);
    }

    opacity: 0.5;

    &:active,
    &:hover,
    &:focus,
    &.active {
      opacity: 1;
    }
  }
`

class SecondaryNav extends React.Component {
  static propTypes = {
    parent: PropTypes.object.isRequired,
    client: PropTypes.shape({
      onHelpLinkClick: PropTypes.func.isRequired
    }).isRequired
  }

  render() {
    return (
      <React.Fragment>
        <Button
          activeClassName="active"
          data-testid="tools-nav-btn"
          parent={this.props.parent}
          to="/tools"
        >
          Tools
        </Button>
        <Button
          activeClassName="active"
          data-testid="help-nav-btn"
          onClick={this.props.client.onHelpLinkClick}
          parent={this.props.parent}
          as={BaseBtn}
        >
          Help
        </Button>
        <IconContainer parent={this.props.parent}>
          <CogIcon size="2.4rem" />
        </IconContainer>
      </React.Fragment>
    )
  }
}

export default withClient(SecondaryNav)
