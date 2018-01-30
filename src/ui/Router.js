import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import React, { Component } from 'react';
import RecoverFromMnemonic from './components/RecoverFromMnemonic';
import Converter from './components/Converter';
import PropTypes from 'prop-types';
import Sidebar from './components/Sidebar';
import Wallets from './components/Wallets';
import Auction from './components/Auction';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const Main = styled.div`
  flex-grow: 1;
  overflow-y: auto;
`;

class Router extends Component {
  static propTypes = {
    onMnemonic: PropTypes.func.isRequired,
    seed: PropTypes.string.isRequired
  };

  render() {
    const { seed, onMnemonic } = this.props;

    return (
      <HashRouter>
        <Container>
          <Sidebar />
          <Main>
            <Switch>
              <Route path="/" exact render={() => <Redirect to="/wallets" />} />
              <Route
                render={() => <Converter seed={seed} />}
                path="/converter"
              />
              <Route path="/auction" render={() => <Auction seed={seed} />} />
              <Route
                render={() => <RecoverFromMnemonic onMnemonic={onMnemonic} />}
                path="/tools"
              />
              <Route path="/wallets" render={() => <Wallets seed={seed} />} />
            </Switch>
          </Main>
        </Container>
      </HashRouter>
    );
  }
}

export default Router;
