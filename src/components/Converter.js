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

const LoadingContainer = styled.div`
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
`

const StatsContainer = styled.div`
  border-radius: 4px;
  background-color: ${p => p.theme.colors.lightShade};
`

const Label = styled.div`
  line-height: 4rem;
  font-size: 3.2rem;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin-right: 2em;
`

const Badge = styled.div`
  display: inline-block;
  line-height: 2.5rem;
  border-radius: 1.4rem;
  background-color: ${p => p.theme.colors.bg.primary};
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  padding: 0.4rem 0.8rem;
`
const Price = styled.div`
  font-size: 2.4rem;
  line-height: 3rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const USDPrice = styled.div`
  line-height: 2rem;
  font-size: 1.6rem;
  font-weight: 600;
  text-align: right;
`

const AvailableAmount = styled.div`
  line-height: 3rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

class Converter extends React.Component {
  static propTypes = {
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
    const { converterPriceUSD, converterStatus } = this.props

    return (
      <DarkLayout title="Autonomous Converter">
        {converterStatus ? (
          <Sp py={4} px={6}>
            <Flex.Row>
              <Flex.Column>
                <StatsContainer>
                  <Sp py={4} px={3}>
                    <Flex.Row justify="space-between" align="baseline">
                      <Label>Current Price</Label>
                      <Flex.Column>
                        <Flex.Row align="baseline">
                          <Badge>1 MTN</Badge>
                          <Price>
                            <DisplayValue
                              maxSize="2.4rem"
                              pre=" = "
                              value={converterStatus.currentPrice}
                              post=" ETH"
                            />
                          </Price>
                        </Flex.Row>
                        <USDPrice>${converterPriceUSD}</USDPrice>
                      </Flex.Column>
                    </Flex.Row>
                  </Sp>
                  <Sp py={4} px={3}>
                    <Flex.Row justify="space-between" align="baseline">
                      <Label>Available MTN</Label>
                      <AvailableAmount>
                        <DisplayValue
                          maxSize="2.4rem"
                          value={converterStatus.availableMtn}
                          post=" MTN"
                        />
                      </AvailableAmount>
                    </Flex.Row>
                  </Sp>
                  <Sp py={4} px={3}>
                    <Flex.Row justify="space-between" align="baseline">
                      <Label>Available ETH</Label>
                      <AvailableAmount>
                        <DisplayValue
                          maxSize="2.4rem"
                          value={converterStatus.availableEth}
                          post=" ETH"
                        />
                      </AvailableAmount>
                    </Flex.Row>
                  </Sp>
                </StatsContainer>
              </Flex.Column>
              <Sp mt={4} ml={2}>
                <Btn data-modal="convert" onClick={this.onOpenModal}>
                  Convert
                </Btn>
              </Sp>
              <ConvertDrawer
                onRequestClose={this.onCloseModal}
                isOpen={this.state.activeModal === 'convert'}
              />
            </Flex.Row>
          </Sp>
        ) : (
          <Sp p={6}>
            <LoadingContainer>
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
  converterPriceUSD: selectors.getConverterPriceUSD(state),
  converterStatus: selectors.getConverterStatus(state)
})

export default connect(mapStateToProps)(Converter)
