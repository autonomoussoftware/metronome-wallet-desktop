import {
  ConverterIcon,
  AuctionIcon,
  WalletIcon,
  LogoIcon,
  Sp
} from '../common';
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Logo from './Logo';

const Container = styled.div`
  background: ${p => p.theme.colors.bg.darkGradient};
  width: 200px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
`;

const MainMenu = styled.nav`
  flex-grow: 1;
`;

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
`;

const SecondaryBtn = styled(NavLink)`
  display: block;
  text-decoration: none;
  color: ${p => p.theme.colors.light};
  padding: 0.8rem 1.6rem;
  line-height: 2rem;
  transition: 0.5s;
  opacity: 0.5;
  transition: 0.6s;
  position: relative;
  &.active {
    opacity: 1;
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
`;

const LogoSmallContainer = styled.div`
  padding: 4.8rem 0 2.4rem 1.6rem;
`;

class App extends Component {
  render() {
    return (
      <Container>
        <Sp pt={4} px={4} pb={7}>
          <Logo />
        </Sp>
        <MainMenu>
          <Button activeClassName="active" to="/wallets">
            <Sp mr={2}>
              <WalletIcon />
            </Sp>Wallets
          </Button>
          <Button activeClassName="active" to="/auction">
            <Sp mr={2}>
              <AuctionIcon />
            </Sp>Auction
          </Button>
          <Button activeClassName="active" to="/converter">
            <Sp mr={2}>
              <ConverterIcon />
            </Sp>Converter
          </Button>
        </MainMenu>
        <Sp mt={2}>
          <SecondaryBtn activeClassName="active" to="/tools">
            Tools
          </SecondaryBtn>
          <SecondaryBtn activeClassName="active" to="/settings">
            Settings
          </SecondaryBtn>
          <SecondaryBtn activeClassName="active" to="/help">
            Help
          </SecondaryBtn>
        </Sp>
        <LogoSmallContainer>
          <LogoIcon negative />
        </LogoSmallContainer>
      </Container>
    );
  }
}

export default App;
