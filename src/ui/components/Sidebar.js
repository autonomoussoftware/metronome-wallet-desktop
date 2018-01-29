import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  background: ${p => p.theme.bg.darkGradient};
  min-width: 200px;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  height: 130px;
  padding: 3.2rem;
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
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  &:first-child {
    border-top: 2px solid rgba(0, 0, 0, 0.2);
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

const SecondaryMenu = styled.nav`
  padding-bottom: 0.8rem;
`;

const SecondaryBtn = styled(NavLink)`
  display: block;
  text-decoration: none;
  color: ${p => p.theme.colors.light};
  padding: 0.8rem 1.6rem;
  line-height: 2rem;
  transition: 0.5s;
  opacity: 0.5;
  &.active {
  }
`;

class App extends Component {
  render() {
    return (
      <Container>
        <Logo>Logo</Logo>
        <MainMenu>
          <Button activeClassName="active" to="/wallets">
            Wallets
          </Button>
          <Button activeClassName="active" to="/auction">
            Auction
          </Button>
          <Button activeClassName="active" to="/exchanger">
            Exchanger
          </Button>
        </MainMenu>
        <SecondaryMenu>
          <SecondaryBtn activeClassName="active" to="/tools">
            Tools
          </SecondaryBtn>
          <SecondaryBtn activeClassName="active" to="/settings">
            Settings
          </SecondaryBtn>
          <SecondaryBtn activeClassName="active" to="/help">
            Help
          </SecondaryBtn>
        </SecondaryMenu>
      </Container>
    );
  }
}

export default App;
