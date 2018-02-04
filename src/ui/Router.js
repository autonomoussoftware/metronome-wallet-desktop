import { HashRouter, Switch, Route, Redirect } from 'react-router-dom'
import React, { Component } from 'react'
import RecoverFromMnemonic from './components/RecoverFromMnemonic'
import Converter from './components/Converter'
import Settings from './components/Settings'
import Sidebar from './components/Sidebar'
import Wallets from './components/Wallets'
import Auction from './components/Auction'
import styled from 'styled-components'
import Help from './components/Help'

const Container = styled.div`
  display: flex;
  height: 100vh;
`

const Main = styled.div`
  flex-grow: 1;
  overflow-y: auto;
`

class Router extends Component {
  render() {
    return (
      <HashRouter>
        <Container>
          <Sidebar />
          <Main>
            <Switch>
              <Route path="/" exact render={() => <Redirect to="/wallets" />} />
              <Route path="/wallets" component={Wallets} />
              <Route path="/auction" component={Auction} />
              <Route path="/converter" component={Converter} />
              <Route path="/tools" component={RecoverFromMnemonic} />
              <Route component={Settings} path="/settings" />
              <Route component={Help} path="/help" />
            </Switch>
          </Main>
        </Container>
      </HashRouter>
    )
  }
}

export default Router
