import { ConverterIcon, AuctionIcon, WalletIcon, LogoIcon, Sp } from './common'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import Logo from './Logo'

const Container = styled.div`
  background: ${p => p.theme.colors.bg.darkGradient};
  width: 64px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
  transition: width 0.3s;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 2;
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
  @media (min-width: 800px) {
    display: block;
  }
`
const LogoSmallContainer = styled.div`
  padding: 2.3rem 1.6rem;
  height: 125px;
  display: block;
  @media (min-width: 800px) {
    display: none;
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
  @media (min-width: 800px) {
    margin-left: 0;
  }
`

const BtnText = styled.span`
  opacity: 0;
  ${Container}:hover & {
    opacity: 1;
  }
  @media (min-width: 800px) {
    opacity: 1;
  }
`

const SecondaryBtn = styled(NavLink)`
  display: block;
  text-decoration: none;
  color: ${p => p.theme.colors.light};
  padding: 0.8rem 1.6rem;
  line-height: 2rem;
  opacity: 0;
  transition: 0.6s;
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

  ${Container}:hover & {
    opacity: 0.5;

    &.active {
      opacity: 1;
    }
  }

  @media (min-width: 800px) {
    opacity: 0.5;
    &.active {
      opacity: 1;
    }
  }
`

const Footer = styled.div`
  padding: 4.8rem 1.6rem 2.4rem;
  height: 104px;
  transition: opacity 0.3s;
  opacity: 0;
  @media (min-width: 800px) {
    opacity: 1;
  }
`

class Sidebar extends Component {
  render() {
    return (
      <Container>
        <LogoLargeContainer>
          <Logo />
        </LogoLargeContainer>
        <LogoSmallContainer>
          <LogoIcon negative />
        </LogoSmallContainer>

        <MainMenu>
          <Button activeClassName="active" to="/wallets">
            <IconWrapper>
              <WalletIcon />
            </IconWrapper>
            <BtnText>Wallets</BtnText>
          </Button>
          <Button activeClassName="active" to="/auction">
            <IconWrapper>
              <AuctionIcon />
            </IconWrapper>
            <BtnText>Auction</BtnText>
          </Button>
          <Button activeClassName="active" to="/converter">
            <IconWrapper>
              <ConverterIcon />
            </IconWrapper>
            <BtnText>Converter</BtnText>
          </Button>
        </MainMenu>
        <Sp mt={2}>
          <SecondaryBtn activeClassName="active" to="/tools">
            Tools
          </SecondaryBtn>
          <SecondaryBtn activeClassName="active" to="/settings">
            Settings
          </SecondaryBtn>
          <SecondaryBtn activeClassName="active" disabled to="/help">
            Help
          </SecondaryBtn>
        </Sp>
        <Footer>
          <LogoIcon negative />
        </Footer>
      </Container>
    )
  }
}

export default Sidebar
