import { HashRouter, Switch, Route, Redirect } from 'react-router-dom'
import React, { Component } from 'react'
import OfflineWarning from './OfflineWarning'
import Dashboard from './Dashboard'
import Converter from './Converter'
import Sidebar from './Sidebar'
import Auction from './Auction'
import styled from 'styled-components'
import Tools from './Tools'
import Help from './Help'

const Container = styled.div`
  display: flex;
  height: 100vh;
  padding-left: 64px;

  @media (min-width: 800px) {
    padding-left: 0;
    left: 200px;
  }
`

const Main = styled.div`
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
`

export const layout = (
  <Container data-testid="router-container">
    <Sidebar />
    <Main
      data-scrollelement // Required by react-virtualized implementation in Dashboard/TxList
    >
      <Switch>
        <Route path="/" exact render={() => <Redirect to="/wallets" />} />
        <Route path="/wallets" component={Dashboard} />
        <Route path="/auction" component={Auction} />
        <Route path="/converter" component={Converter} />
        <Route path="/tools" component={Tools} />
        <Route component={Help} path="/help" />
      </Switch>
    </Main>
    <OfflineWarning />
  </Container>
)

export default class Router extends Component {
  render() {
    return <HashRouter>{layout}</HashRouter>
  }
}
