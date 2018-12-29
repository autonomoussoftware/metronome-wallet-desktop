import withPortState from 'metronome-wallet-ui-logic/src/hocs/withPortState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DarkLayout, DisplayValue, Flex, Btn } from '../common'
import PortDrawer from './PortDrawer'

const Container = styled.div`
  display: flex;
  padding: 3.2rem 4.8rem;
  align-items: flex-start;
  flex-direction: row;
`

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
`

const Description = styled.p`
  font-size: 1.3rem;
  letter-spacing: 0.4px;
  color: #c2c4c6;
  margin-top: 0.8rem;
  margin-bottom: 0;
`

const List = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-left: 0;
  margin-right: 0;
  margin-top: 2.4rem;
  margin-bottom: 4.8rem;
`

const Item = styled.li`
  background-color: ${({ theme }) => theme.colors.lightShade};
  border-radius: 2px;
  padding: 1.2rem 2.4rem 1.2rem 1.6rem;

  & + & {
    margin-top: 1.6rem;
  }
`

const LeftLabel = styled.div`
  font-size: 1.4rem;
  letter-spacing: 0.4px;
  color: #c2c4c6;
`

const Hiddable = styled.span`
  display: none;

  @media (min-width: 1000px) {
    display: inline;
  }
`

const Validations = styled.span`
  background-color: ${({ theme }) => theme.colors.darkShade};
  color: ${({ theme }) => theme.colors.light};
  padding: 0.5rem 1.2rem;
  border-radius: 1.2rem;
  margin-right: 2.4rem;
  font-size: 1.1rem;
`

const Amount = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
  font-weight: 600;
`

const Details = styled.div`
  font-size: 1.1rem;
  letter-spacing: 0.4px;
  color: #c2c4c6;

  & > span {
    color: ${({ theme }) => theme.colors.light};
    font-size: 1.3rem;
    font-weight: 600;
    text-transform: uppercase;
  }
`

const RetryBtn = styled(Btn)`
  margin-left: 2.4rem;
  background-color: rgba(126, 97, 248, 0.4);
  background-image: none;
  color: ${({ theme }) => theme.colors.light};
  font-size: 1.3rem;
  letter-spacing: 0.4px;
  min-width: 108px;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  box-shadow: none;

  &:hover,
  &:focus {
    opacity: 0.8;
  }
`

const BtnContainer = styled.div`
  margin-top: 5rem;
  margin-left: 2.4rem;
`

const PortBtn = styled(Btn)`
  min-width: 200px;
`

class Port extends React.Component {
  static propTypes = {
    portDisabledReason: PropTypes.string,
    pendingImports: PropTypes.arrayOf(
      PropTypes.shape({
        destinationChain: PropTypes.string.isRequired,
        totalValidators: PropTypes.number.isRequired,
        validations: PropTypes.number.isRequired,
        originChain: PropTypes.string.isRequired,
        amount: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired
      })
    ).isRequired,
    failedImports: PropTypes.arrayOf(
      PropTypes.shape({
        originChain: PropTypes.string.isRequired,
        amount: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired
      })
    ).isRequired,
    portDisabled: PropTypes.bool.isRequired,
    onRetry: PropTypes.func.isRequired
  }

  state = {
    activeModal: null
  }

  handleRetryClick = e => this.props.onRetry(e.target.dataset.hash)

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () => this.setState({ activeModal: null })

  render() {
    return (
      <DarkLayout data-testid="port-container" title="Port">
        <Container>
          <Flex.Item grow="1">
            <Title>Pending Imports</Title>
            <List>
              {this.props.pendingImports.map(item => (
                <Item key={item.hash}>
                  <Flex.Row justify="space-between" align="center">
                    <LeftLabel>
                      <Validations>
                        {item.validations}/{item.totalValidators}
                      </Validations>{' '}
                      <Hiddable>VALIDATIONS</Hiddable>
                    </LeftLabel>
                    <Flex.Column align="flex-end">
                      <Amount>
                        <DisplayValue value={item.amount} post=" MET" />
                      </Amount>
                      <Details>
                        IMPORTING FROM <span>{item.originChain}</span> to{' '}
                        <span>{item.destinationChain}</span>
                      </Details>
                    </Flex.Column>
                  </Flex.Row>
                </Item>
              ))}
            </List>
            {this.props.failedImports.length > 0 && (
              <div>
                <Title>Failed Imports</Title>
                <Description>
                  Resubmit incomplete imports that failed to excecute by
                  clicking Retry.
                </Description>
                <List>
                  {this.props.failedImports.map(item => (
                    <Item key={item.hash}>
                      <Flex.Row justify="space-between" align="center">
                        <LeftLabel>FAILED</LeftLabel>
                        <Flex.Row justify="space-between" align="center">
                          <Flex.Column align="flex-end">
                            <Amount>
                              <DisplayValue value={item.amount} post=" MET" />
                            </Amount>
                            <Details>
                              IMPORTING FROM <span>{item.originChain}</span>
                            </Details>
                          </Flex.Column>
                          <RetryBtn
                            data-hash={item.hash}
                            onClick={this.handleRetryClick}
                          >
                            Retry
                          </RetryBtn>
                        </Flex.Row>
                      </Flex.Row>
                    </Item>
                  ))}
                </List>
              </div>
            )}
          </Flex.Item>

          <BtnContainer>
            <PortBtn
              data-rh-negative
              data-disabled={this.props.portDisabled}
              data-testid="port-btn"
              data-modal="port"
              onClick={this.props.portDisabled ? null : this.onOpenModal}
              data-rh={this.props.portDisabledReason}
            >
              New Port
            </PortBtn>
          </BtnContainer>

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
