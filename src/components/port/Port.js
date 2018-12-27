import withPortState from 'metronome-wallet-ui-logic/src/hocs/withPortState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DarkLayout, Btn } from '../common'
import PortDrawer from './PortDrawer'

const Container = styled.div`
  padding: 3.2rem 2.4rem;
  display: flex;
  align-items: center;
  flex-direction: column;

  @media (min-width: 1180px) {
    padding: 3.2rem 4.8rem;
    align-items: flex-start;
    flex-direction: row;
  }
`

const PortBtn = styled(Btn)`
  margin-top: 3.2rem;
  min-width: 260px;

  @media (min-width: 1180px) {
    min-width: 200px;
    margin-top: 0;
  }
`

class Port extends React.Component {
  static propTypes = {
    portDisabledReason: PropTypes.string,
    portDisabled: PropTypes.bool.isRequired
  }

  state = {
    activeModal: null
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  render() {
    return (
      <DarkLayout data-testid="port-container" title="Port">
        <Container>
          <PortBtn
            data-rh-negative
            data-disabled={this.props.portDisabled}
            data-testid="port-btn"
            data-modal="port"
            onClick={this.props.portDisabled ? null : this.onOpenModal}
            data-rh={this.props.portDisabledReason}
          >
            Port
          </PortBtn>

          <PortDrawer
            onRequestClose={this.onCloseModal}
            isOpen={this.state.activeModal === 'port'}
          />
        </Container>
      </DarkLayout>
    )
  }
}

export default withPortState(Port)
