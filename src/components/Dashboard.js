import DashboardHeader from './DashboardHeader'
import * as selectors from '../selectors'
import ReceiveDrawer from './ReceiveDrawer'
import BalanceBlock from './BalanceBlock'
import { connect } from 'react-redux'
import SendDrawer from './SendDrawer'
import PropTypes from 'prop-types'
import { Btn } from './common'
import styled from 'styled-components'
import TxList from './TxList'
import React from 'react'

const Container = styled.div`
  background-color: ${p => p.theme.colors.bg.primary};
  padding: 7.2rem 2.4rem;
  min-height: 100%;
  position: relative;

  @media (min-width: 800px) {
    padding: 7.2rem 4.8rem;
  }
`

const FixedContainer = styled.div`
  background-color: ${p => p.theme.colors.bg.primary};
  position: fixed;
  padding: 0 2.4rem;
  left: 64px;
  z-index: 2;
  right: 0;
  top: 0;
  @media (min-width: 800px) {
    padding: 0 4.8rem;
    left: 200px;
  }
`

const Hero = styled.div`
  margin-top: 4.8rem;
  @media (min-width: 1040px) {
    display: flex;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  background-color: ${p => p.theme.colors.lightShade};
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

const ReceiveBtn = Btn.extend`
  margin-left: 3.2rem;

  @media (min-width: 1040px) {
    margin-left: 0;
    margin-top: 1.6rem;
  }
`

const NoTx = styled.div`
  font-size: 1.6rem;
  margin-top: 4.8rem;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

class Dashboard extends React.Component {
  static propTypes = {
    hasTransactions: PropTypes.bool.isRequired,
    isSendEnabled: PropTypes.bool.isRequired
  }

  state = {
    activeModal: null
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  render() {
    const { isSendEnabled, hasTransactions } = this.props

    return (
      <Container>
        <FixedContainer>
          <DashboardHeader />
        </FixedContainer>

        <Hero>
          <Left>
            <BalanceBlock />
          </Left>
          <Right>
            <Btn
              data-modal="send"
              disabled={!isSendEnabled}
              onClick={this.onOpenModal}
              block
            >
              Send
            </Btn>
            <ReceiveBtn block data-modal="receive" onClick={this.onOpenModal}>
              Receive
            </ReceiveBtn>
          </Right>
        </Hero>

        {hasTransactions ? (
          <TxList />
        ) : (
          <NoTx>No transactions to show yet.</NoTx>
        )}

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

const mapStateToProps = state => ({
  hasTransactions: selectors.getActiveWalletTransactions(state).length > 0,
  isSendEnabled: selectors.isSendEnabled(state)
})

export default connect(mapStateToProps)(Dashboard)
