import { HashRouter, Switch, Route, Redirect } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import React from 'react'

import OfflineWarning from './OfflineWarning'
import Dashboard from './dashboard/Dashboard'
import Converter from './converter/Converter'
import Sidebar from './sidebar/Sidebar'
import Auction from './auction/Auction'
import Tools from './tools/Tools'
import Port from './port/Port'

const fadeIn = keyframes`
  from {
    transform: scale(1.025);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`

const Container = styled.div`
  display: flex;
  height: 100vh;
  padding-left: 64px;
  animation: ${fadeIn} 0.3s linear;

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
        <Route path="/port" component={Port} />
        <Route path="/tools" component={Tools} />
      </Switch>
    </Main>
    <OfflineWarning />
  </Container>
)

export default class Router extends React.Component {
  render() {
    return <HashRouter>{layout}</HashRouter>
  }
}
