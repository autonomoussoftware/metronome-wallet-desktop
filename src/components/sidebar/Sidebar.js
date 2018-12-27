import { withClient } from 'metronome-wallet-ui-logic/src/hocs/clientContext'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import ConverterIcon from '../icons/ConverterIcon'
import ChainSelector from './ChainSelector'
import AuctionIcon from '../icons/AuctionIcon'
import WalletIcon from '../icons/WalletIcon'
import LogoIcon from '../icons/LogoIcon'
import PortIcon from '../icons/PortIcon'
import CogIcon from '../icons/CogIcon'
import { Sp } from '../common'
import Logo from './Logo'

const Container = styled.div`
  background: ${p => p.theme.colors.darkGradient};
  width: 64px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 3;
  &:hover {
    width: 200px;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.2);
  }
  @media (min-width: 800px) {
    position: static;
    width: 200px;
    &:hover {
      box-shadow: none;
    }
  }
`

const LogoLargeContainer = styled.div`
  padding: 3.2rem 3.2rem 5.6rem;
  height: 125px;
  display: none;
  flex-shrink: 0;
  @media (min-width: 800px) {
    display: block;
  }
`

const LogoSmallContainer = styled.div`
  padding: 2.3rem 1.6rem;
  height: 125px;
  display: block;
  flex-shrink: 0;
  @media (min-width: 800px) {
    display: none;
  }
`

const SecondaryNavIcon = styled.div`
  padding: 3.2rem 0 2.4rem 1.9rem;
  display: block;

  @media (min-height: 650px) {
    padding-top: 6rem;
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

  ${Container}:hover & svg {
    opacity: 1;
    transform: rotate(-90deg);
  }
`

const MainMenu = styled.nav`
  flex-grow: 1;
`

const Button = styled(NavLink)`
  display: flex;
  min-height: 7.1rem;
  align-items: center;
  text-decoration: none;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: ${p => p.theme.colors.light};
  padding: 1.6rem;
  transition: 0.5s;
  opacity: 0.5;
  border-bottom: 2px solid ${p => p.theme.colors.darkShade};
  &:focus {
    outline: none;
  }
  &:first-child {
    border-top: 2px solid ${p => p.theme.colors.darkShade};
  }
  &.active {
    border-bottom-color: ${p => p.theme.colors.primary};
    background-image: linear-gradient(
      250deg,
      rgba(66, 53, 119, 0.4),
      rgba(126, 97, 248, 0.1)
    );
    opacity: 1;
  }
`

const IconWrapper = styled.div`
  margin-right: 1.6rem;
  margin-left: 0.3rem;
`

const BtnText = styled.span`
  opacity: 0;
  flex-grow: 1;
  ${Container}:hover & {
    opacity: 1;
  }
  @media (min-width: 800px) {
    opacity: 1;
  }
`

const Badge = styled.div`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.danger};
  border-radius: 1.2rem;
  font-size: 1.1rem;
  height: 2.4rem;
  line-height: 2.4rem;
  padding: 0 0.8rem;
  letter-spacing: 1px;
  min-width: 3.2rem;
  text-align: center;
  transform: translateX(-70px);

  ${Container}:hover & {
    background-color: ${({ theme }) => theme.colors.darkDanger};
    transform: translateX(0px);
  }
  @media (min-width: 800px) {
    background-color: ${({ theme }) => theme.colors.darkDanger};
    transform: translateX(0px);
  }
`

// TODO: Reuse SecondaryLink & SecondaryBtn styles
const SecondaryBtn = styled(NavLink)`
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
    transform: translateY(6rem);
  }

  ${Container}:hover & {
    transform: translateY(0);
    opacity: 0.5;
    transition: all 600ms, opacity 400ms, transform 400ms;
    transition-delay: 0s, 100ms, 0s;

    &.active {
      opacity: 1;
    }
  }

  @media (min-width: 800px) {
    ${Container} & {
      transform: translateY(0);
    }
    opacity: 0.5;
    &.active {
      opacity: 1;
    }
  }
`

const SecondaryLink = styled.a`
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
    transform: translateY(6rem);
  }

  ${Container}:hover & {
    transform: translateY(0);
    opacity: 0.5;
    transition: all 600ms, opacity 400ms, transform 400ms;
    transition-delay: 0s, 100ms, 0s;

    &.active {
      opacity: 1;
    }
  }

  @media (min-width: 800px) {
    ${Container} & {
      transform: translateY(0);
    }
    opacity: 0.5;
    &.active {
      opacity: 1;
    }
  }
`

const Footer = styled.div`
  padding: 2.4rem 1.6rem 2.4rem;
  display: none;

  @media (min-width: 800px) {
    display: block;
  }
`

class Sidebar extends React.Component {
  static propTypes = {
    client: PropTypes.shape({
      onHelpLinkClick: PropTypes.func.isRequired
    }).isRequired
  }

  render() {
    return (
      <Container>
        <LogoLargeContainer>
          <Logo />
        </LogoLargeContainer>
        <LogoSmallContainer>
          <LogoIcon negative />
        </LogoSmallContainer>
        <Sp mx={2} mb={3}>
          <ChainSelector />
        </Sp>
        <MainMenu>
          <Button
            activeClassName="active"
            data-testid="wallets-nav-btn"
            to="/wallets"
          >
            <IconWrapper>
              <WalletIcon />
            </IconWrapper>
            <BtnText>Wallet</BtnText>
          </Button>
          <Button
            activeClassName="active"
            data-testid="auction-nav-btn"
            to="/auction"
          >
            <IconWrapper>
              <AuctionIcon />
            </IconWrapper>
            <BtnText>Auction</BtnText>
          </Button>
          <Button
            activeClassName="active"
            data-testid="converter-nav-btn"
            to="/converter"
          >
            <IconWrapper>
              <ConverterIcon />
            </IconWrapper>
            <BtnText>Converter</BtnText>
          </Button>
          <Button
            activeClassName="active"
            data-testid="port-nav-btn"
            to="/port"
          >
            <IconWrapper>
              <PortIcon />
            </IconWrapper>
            <BtnText>Port</BtnText>
            <Badge>10</Badge>
          </Button>
        </MainMenu>
        <Sp mt={2}>
          <SecondaryBtn
            activeClassName="active"
            data-testid="tools-nav-btn"
            to="/tools"
          >
            Tools
          </SecondaryBtn>
          <SecondaryLink
            activeClassName="active"
            data-testid="help-nav-btn"
            onClick={this.props.client.onHelpLinkClick}
          >
            Help
          </SecondaryLink>
          <SecondaryNavIcon>
            <CogIcon size="2.4rem" />
          </SecondaryNavIcon>
        </Sp>
        <Footer>
          <LogoIcon negative />
        </Footer>
      </Container>
    )
  }
}

export default withClient(Sidebar)
