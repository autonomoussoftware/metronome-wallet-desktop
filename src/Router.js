import { HashRouter, Switch, Route, Redirect } from 'react-router-dom'
import React, { Component } from 'react'
import RecoverFromMnemonic from './components/RecoverFromMnemonic'
import Dashboard from './components/Dashboard'
import Converter from './components/Converter'
import Settings from './components/Settings'
import Sidebar from './components/Sidebar'
import Auction from './components/Auction'
import styled from 'styled-components'
import Help from './components/Help'

const Container = styled.div`
  display: flex;
  height: 100vh;
`

const Main = styled.div`
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
`

export default class Router extends Component {
  render() {
    return (
      <HashRouter>
        <Container>
          <Sidebar />
          <Main>
            <Switch>
              <Route path="/" exact render={() => <Redirect to="/wallets" />} />
              <Route path="/wallets" component={Dashboard} />
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
