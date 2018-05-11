import * as selectors from '../selectors'
import ConvertDrawer from './ConvertDrawer'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import {
  DisplayValue,
  DarkLayout,
  LoadingBar,
  Text,
  Flex,
  Btn,
  Sp
} from './common'

const Container = styled.div`
  padding: 3.2rem 2.4rem;
  display: flex;
  align-items: center;
  flex-direction: column;

  @media (min-width: 1100px) {
    padding: 3.2rem 4.8rem;
    align-items: flex-start;
    flex-direction: row;
  }
`

const ConvertBtn = styled(Btn)`
  margin-top: 3.2rem;
  min-width: 260px;

  @media (min-width: 1100px) {
    min-width: 200px;
    margin-top: 0;
  }
`

const LoadingContainer = styled.div`
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
`

const StatsContainer = styled.div`
  border-radius: 4px;
  background-color: ${p => p.theme.colors.lightShade};
  flex-grow: 1;
  margin-right: 0;
  width: 100%;

  @media (min-width: 1100px) {
    margin-right: 1.6rem;
    max-width: 660px;
  }
`

const Label = styled.div`
  line-height: 4rem;
  font-size: 2.4rem;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin-right: 2em;
  white-space: nowrap;
`

const Badge = styled.div`
  display: inline-block;
  line-height: 2.5rem;
  border-radius: 1.4rem;
  background-color: ${p => p.theme.colors.bg.primary};
  font-size: 1.6rem;
  font-weight: 600;
  text-align: center;
  padding: 0.4rem 0.8rem;
  margin-right: 0.4rem;

  @media (min-width: 860px) {
    font-size: 2rem;
  }
`
const Price = styled.div`
  font-size: 1.6rem;
  line-height: 3rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};

  @media (min-width: 860px) {
    font-size: 2.4rem;
  }
`

const USDPrice = styled.div`
  line-height: 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: right;

  @media (min-width: 860px) {
    font-size: 1.6rem;
  }
`

const AvailableAmount = styled.div`
  line-height: 1.6rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};

  @media (min-width: 860px) {
    font-size: 2.4rem;
  }
`

class Converter extends React.Component {
  static propTypes = {
    convertFeatureStatus: PropTypes.oneOf([
      'in-initial-auction',
      'transfer-disabled',
      'offline',
      'ok'
    ]).isRequired,
    converterPriceUSD: PropTypes.string.isRequired,
    converterStatus: PropTypes.shape({
      availableEth: PropTypes.string.isRequired,
      availableMtn: PropTypes.string.isRequired
    })
  }

  state = {
    activeModal: null
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  render() {
    const {
      convertFeatureStatus,
      converterPriceUSD,
      converterStatus
    } = this.props

    return (
      <DarkLayout
        data-testid="converter-container"
        title="Autonomous Converter"
      >
        {converterStatus ? (
          <Container>
            <StatsContainer data-testid="stats">
              <Sp p={2}>
                <Flex.Row justify="space-between" align="baseline">
                  <Label>Current Price</Label>
                  <Flex.Column>
                    <Flex.Row align="baseline">
                      <Badge>1 MET</Badge>
                      <Price>
                        <DisplayValue
                          maxSize="inherit"
                          pre=" = "
                          value={converterStatus.currentPrice}
                          post=" ETH"
                        />
                      </Price>
                    </Flex.Row>
                    <USDPrice>{converterPriceUSD}</USDPrice>
                  </Flex.Column>
                </Flex.Row>
              </Sp>
              <Sp p={2}>
                <Flex.Row justify="space-between" align="baseline">
                  <Label>Available MET</Label>
                  <AvailableAmount>
                    <DisplayValue
                      maxSize="inherit"
                      value={converterStatus.availableMtn}
                      post=" MET"
                    />
                  </AvailableAmount>
                </Flex.Row>
              </Sp>
              <Sp p={2}>
                <Flex.Row justify="space-between" align="baseline">
                  <Label>Available ETH</Label>
                  <AvailableAmount>
                    <DisplayValue
                      maxSize="inherit"
                      value={converterStatus.availableEth}
                      post=" ETH"
                    />
                  </AvailableAmount>
                </Flex.Row>
              </Sp>
            </StatsContainer>

            <ConvertBtn
              data-disabled={convertFeatureStatus !== 'ok' ? true : null}
              data-rh-negative
              data-rh={
                convertFeatureStatus === 'offline'
                  ? "Can't convert while offline"
                  : convertFeatureStatus === 'in-initial-auction'
                    ? 'Conversions are disabled during Initial Auction'
                    : convertFeatureStatus === 'transfer-disabled'
                      ? 'MET conversions not enabled yet'
                      : null
              }
              data-modal="convert"
              data-testid="convert-btn"
              onClick={convertFeatureStatus === 'ok' ? this.onOpenModal : null}
            >
              Convert
            </ConvertBtn>

            <ConvertDrawer
              onRequestClose={this.onCloseModal}
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
      </DarkLayout>
    )
  }
}

const mapStateToProps = state => ({
  convertFeatureStatus: selectors.convertFeatureStatus(state),
  converterPriceUSD: selectors.getConverterPriceUSD(state),
  converterStatus: selectors.getConverterStatus(state)
})

export default connect(mapStateToProps)(Converter)
