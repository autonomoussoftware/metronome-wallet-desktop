import withConverterState from 'metronome-wallet-ui-logic/src/hocs/withConverterState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DarkLayout, LastUpdated, LoadingBar, Text, Btn, Sp } from '../common'
import ConvertDrawer from './ConvertDrawer'
import Stats from './Stats'

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

const LastUpdatedContainer = styled.div`
  padding: 0 2.4rem 3.2rem;
  @media (min-width: 1180px) {
    padding: 0 4.8rem 3.2rem;
  }
`

class Converter extends React.Component {
  static propTypes = {
    convertDisabledReason: PropTypes.string,
    converterPriceUSD: PropTypes.string.isRequired,
    convertDisabled: PropTypes.bool.isRequired,
    converterStatus: PropTypes.object,
    lastUpdated: PropTypes.number,
    coinSymbol: PropTypes.string.isRequired
  }

  state = {
    activeModal: null
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  render() {
    return (
      <DarkLayout
        data-testid="converter-container"
        title="Autonomous Converter"
      >
        {this.props.converterStatus ? (
          <Container>
            <Stats
              converterPriceUSD={this.props.converterPriceUSD}
              converterStatus={this.props.converterStatus}
              coinSymbol={this.props.coinSymbol}
            />

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

            <ConvertDrawer
              onRequestClose={this.onCloseModal}
              coinSymbol={this.props.coinSymbol}
              isOpen={this.state.activeModal === 'convert'}
            />
          </Container>
        ) : (
          <Sp p={6}>
            <LoadingContainer data-testid="waiting">
              <Text>Waiting for converter status...</Text>
              <Sp py={2}>
                <LoadingBar />
              </Sp>
            </LoadingContainer>
          </Sp>
        )}
        <LastUpdatedContainer>
          <LastUpdated timestamp={this.props.lastUpdated} />
        </LastUpdatedContainer>
      </DarkLayout>
    )
  }
}

export default withConverterState(Converter)
