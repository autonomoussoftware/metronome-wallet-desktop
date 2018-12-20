import withPortState from 'metronome-wallet-ui-logic/src/hocs/withPortState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DarkLayout, LoadingBar, Text, Btn, Sp } from '../common'
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

const ConvertBtn = styled(Btn)`
  margin-top: 3.2rem;
  min-width: 260px;

  @media (min-width: 1180px) {
    min-width: 200px;
    margin-top: 0;
  }
`

const LoadingContainer = styled.div`
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
`

class Port extends React.Component {
  static propTypes = {
    convertDisabledReason: PropTypes.string,
    convertDisabled: PropTypes.bool.isRequired,
    converterStatus: PropTypes.object
  }

  state = {
    activeModal: null
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  render() {
    return (
      <DarkLayout data-testid="port-container" title="Port">
        {this.props.converterStatus ? (
          <Container>
            <ConvertBtn
              data-rh-negative
              data-disabled={this.props.convertDisabled}
              data-testid="convert-btn"
              data-modal="convert"
              onClick={this.props.convertDisabled ? null : this.onOpenModal}
              data-rh={this.props.convertDisabledReason}
            >
              Convert
            </ConvertBtn>

            <PortDrawer
              onRequestClose={this.onCloseModal}
              isOpen={this.state.activeModal === 'port'}
            />
          </Container>
        ) : (
          <Sp p={6}>
            <LoadingContainer data-testid="waiting">
              <Text>Waiting for port status...</Text>
              <Sp py={2}>
                <LoadingBar />
              </Sp>
            </LoadingContainer>
          </Sp>
        )}
      </DarkLayout>
    )
  }
}

export default withPortState(Port)
