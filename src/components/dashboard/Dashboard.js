import withDashboardState from 'metronome-wallet-ui-logic/src/hocs/withDashboardState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import DashboardHeader from './DashboardHeader'
import ReceiveDrawer from './ReceiveDrawer'
import BalanceBlock from './BalanceBlock'
import SendDrawer from './SendDrawer'
import { Btn } from '../common'
import TxList from './tx-list/TxList'

const Container = styled.div`
  background-color: ${(p) => p.theme.colors.primary};
  padding: 0 2.4rem 2.4rem;
  min-height: 100%;
  position: relative;

  @media (min-width: 800px) {
    padding: 0 4.8rem 4.8rem;
  }
`

const FixedContainer = styled.div`
  background-color: ${(p) => p.theme.colors.primary};
  position: sticky;
  padding: 0 1.6rem;
  margin: 0 -1.6rem;
  z-index: 2;
  right: 0;
  left: 0;
  top: 0;
`

const Hero = styled.div`
  margin-top: 2.4rem;
  @media (min-width: 1040px) {
    margin-top: 4.8rem;
    display: flex;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  background-color: ${(p) => p.theme.colors.lightShade};
  border-radius: 4px;
  padding: 0 1.2rem;
  @media (min-width: 1040px) {
    padding: 0 2.4rem;
  }
`

const Right = styled.div`
  display: flex;
  justify-content: center;
  min-width: 18rem;
  margin-top: 3.2rem;

  @media (min-width: 1040px) {
    margin-top: 0;
    margin-left: 1.6rem;
    flex-direction: column;
  }
`

const ReceiveBtn = styled(Btn)`
  margin-left: 3.2rem;

  @media (min-width: 1040px) {
    margin-left: 0;
    margin-top: 1.6rem;
  }
`

class Dashboard extends React.Component {
  static propTypes = {
    sendDisabledReason: PropTypes.string,
    hasTransactions: PropTypes.bool.isRequired,
    copyToClipboard: PropTypes.func.isRequired,
    onWalletRefresh: PropTypes.func.isRequired,
    sendDisabled: PropTypes.bool.isRequired,
    syncStatus: PropTypes.oneOf(['up-to-date', 'syncing', 'failed']).isRequired,
    address: PropTypes.string.isRequired,
  }

  state = {
    activeModal: null,
  }

  onOpenModal = (e) => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  render() {
    return (
      <Container data-testid="dashboard-container">
        <FixedContainer>
          <DashboardHeader
            copyToClipboard={this.props.copyToClipboard}
            address={this.props.address}
          />
        </FixedContainer>

        <Hero>
          <Left>
            <BalanceBlock />
          </Left>
          <Right>
            <Btn
              data-disabled={this.props.sendDisabled}
              data-testid="send-btn"
              data-modal="send"
              onClick={this.props.sendDisabled ? null : this.onOpenModal}
              data-rh={this.props.sendDisabledReason}
              block
            >
              Send
            </Btn>

            <ReceiveBtn
              data-testid="receive-btn"
              data-modal="receive"
              onClick={this.onOpenModal}
              block
            >
              Receive
            </ReceiveBtn>
          </Right>
        </Hero>

        <TxList
          hasTransactions={this.props.hasTransactions}
          onWalletRefresh={this.props.onWalletRefresh}
          syncStatus={this.props.syncStatus}
        />

        <ReceiveDrawer
          onRequestClose={this.onCloseModal}
          isOpen={this.state.activeModal === 'receive'}
        />
        <SendDrawer
          onRequestClose={this.onCloseModal}
          isOpen={this.state.activeModal === 'send'}
        />
      </Container>
    )
  }
}

export default withDashboardState(Dashboard)
