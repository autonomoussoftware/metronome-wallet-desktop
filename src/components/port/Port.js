import { toChecksumAddress } from 'web3-utils'
import withPortState from 'metronome-wallet-ui-logic/src/hocs/withPortState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DarkLayout, DisplayValue, Flex, Btn } from '../common'
import RetryImportDrawer from './RetryImportDrawer'
import FailedImports from './FailedImports'
import PortDrawer from './PortDrawer'

const Container = styled.div`
  display: flex;
  padding: 3.2rem 4.8rem;
  align-items: stretch;
  flex-direction: column;

  @media (min-width: 1000px) {
    align-items: flex-start;
    flex-direction: row;
  }
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

const BtnContainer = styled.div`
  margin-bottom: 3.2rem;
  order: -1;
  align-self: center;

  @media (min-width: 1000px) {
    margin-top: 5rem;
    margin-left: 2.4rem;
    margin-bottom: 0;
    order: 0;
    align-self: flex-start;
  }
`

const PortBtn = styled(Btn)`
  min-width: 200px;
`

class Port extends React.Component {
  static propTypes = {
    retryDisabledReason: PropTypes.string,
    portDisabledReason: PropTypes.string,
    shouldRenderForm: PropTypes.bool.isRequired,
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
    failedImports: PropTypes.array.isRequired,
    retryDisabled: PropTypes.bool.isRequired,
    portDisabled: PropTypes.bool.isRequired
  }

  state = {
    retryCandidate: null,
    activeModal: null
  }

  onOpenModal = e => this.setState({ activeModal: e.target.dataset.modal })

  onCloseModal = () =>
    this.setState({ activeModal: null, retryCandidate: null })

  onRetryClick = hash => {
    const retryCandidate = this.props.failedImports.find(
      ({ currentBurnHash }) => currentBurnHash === hash
    )
    this.setState({
      activeModal: 'retry-import',
      retryCandidate: {
        ...retryCandidate,
        from: toChecksumAddress(retryCandidate.from)
      }
    })
  }

  render() {
    return (
      <DarkLayout data-testid="port-container" title="Port">
        <Container>
          <Flex.Item grow="1">
            {this.props.pendingImports.length > 0 && (
              <React.Fragment>
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
              </React.Fragment>
            )}
            {this.props.failedImports.length > 0 && (
              <div>
                <Title>Failed Imports</Title>
                <Description>
                  Resubmit incomplete imports that failed to excecute by
                  clicking Retry.
                </Description>
                <FailedImports
                  retryDisabledReason={this.props.retryDisabledReason}
                  retryDisabled={this.props.retryDisabled}
                  onRetryClick={this.onRetryClick}
                  items={this.props.failedImports}
                />
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
        </Container>

        {this.props.shouldRenderForm && (
          <PortDrawer
            onRequestClose={this.onCloseModal}
            isOpen={this.state.activeModal === 'port'}
          />
        )}

        {this.props.shouldRenderForm && (
          <RetryImportDrawer
            onRequestClose={this.onCloseModal}
            importData={this.state.retryCandidate}
            isOpen={this.state.activeModal === 'retry-import'}
          />
        )}
      </DarkLayout>
    )
  }
}

export default withPortState(Port)
