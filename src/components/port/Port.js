import { toChecksumAddress } from 'web3-utils'
import withPortState from 'metronome-wallet-ui-logic/src/hocs/withPortState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DarkLayout, Flex, Btn } from '../common'
import RetryImportDrawer from './RetryImportDrawer'
import OngoingImports from './OngoingImports'
import FailedImports from './FailedImports'
import PortDrawer from './PortDrawer'
import PortIcon from '../icons/PortIcon'

const Container = styled.div`
  display: flex;
  padding: 3.2rem 4.8rem;
  align-items: stretch;
  flex-direction: column;
  justify-content: center;

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

  & > span {
    color: ${({ theme }) => theme.colors.light};
    font-size: 1.3rem;
    font-weight: 600;
  }
`

const BtnContainer = styled.div`
  margin-bottom: 3.2rem;
  order: -1;
  align-self: center;
  text-align: center;

  @media (min-width: 1000px) {
    margin-top: 7.2rem;
    margin-left: 2.4rem;
    margin-bottom: 0;
    order: 0;
    align-self: flex-start;
  }
`

const PortBtn = styled(Btn)`
  min-width: 200px;
`
const NoPortsContainer = styled.div`
  margin-top: 3.2rem;
  max-width: 32rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 1000px) {
    margin-top: -5rem;
  }
`

const NoPortsTitle = styled.div`
  margin-top: 3.4rem;
  font-weight: 600;
  font-size: 2.4rem;
  line-height: 3.2rem;
  text-align: center;
  opacity: 0.75;
`

const NoPortsMessage = styled.div`
  margin-top: 0.8rem;
  margin-bottom: 3.2rem;
  font-size: 1.6rem;
  line-height: 2.4rem;
  text-align: center;
`

class Port extends React.Component {
  static propTypes = {
    attestationThreshold: PropTypes.number.isRequired,
    retryDisabledReason: PropTypes.string,
    portDisabledReason: PropTypes.string,
    shouldRenderForm: PropTypes.bool.isRequired,
    ongoingImports: PropTypes.arrayOf(
      PropTypes.shape({
        attestedCount: PropTypes.number.isRequired,
        refutedCount: PropTypes.number.isRequired,
        importedFrom: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
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

  onCloseModal = () => this.setState({ activeModal: null })

  onRetryClick = hash => {
    const retryCandidate = this.props.failedImports
      .concat(this.props.ongoingImports)
      .find(({ currentBurnHash }) => currentBurnHash === hash)
    this.setState({
      activeModal: 'retry-import',
      retryCandidate: {
        ...retryCandidate,
        from: toChecksumAddress(retryCandidate.from)
      }
    })
  }

  // eslint-disable-next-line complexity
  render() {
    return (
      <DarkLayout data-testid="port-container" title="Port">
        <Container>
          {(this.props.failedImports.length > 0 ||
            this.props.ongoingImports.length > 0) && (
            <Flex.Item grow="1">
              {this.props.failedImports.length > 0 && (
                <React.Fragment>
                  <Title>Failed Ports</Title>
                  <Description>
                    Resubmit incomplete ports that failed to execute by clicking
                    Retry.
                  </Description>
                  <FailedImports
                    retryDisabledReason={this.props.retryDisabledReason}
                    retryDisabled={this.props.retryDisabled}
                    onRetryClick={this.onRetryClick}
                    items={this.props.failedImports}
                  />
                </React.Fragment>
              )}

              {this.props.ongoingImports.length > 0 && (
                <React.Fragment>
                  <Title>Ongoing Ports</Title>
                  <Description>
                    An Import Request requires at least{' '}
                    <span>
                      {this.props.attestationThreshold}{' '}
                      {this.props.attestationThreshold > 1
                        ? 'validations'
                        : 'validation'}
                    </span>{' '}
                    for the MET to be imported on this chain.
                  </Description>
                  <OngoingImports
                    attestationThreshold={this.props.attestationThreshold}
                    retryDisabledReason={this.props.retryDisabledReason}
                    retryDisabled={this.props.retryDisabled}
                    onRetryClick={this.onRetryClick}
                    items={this.props.ongoingImports}
                  />
                </React.Fragment>
              )}
            </Flex.Item>
          )}
          <BtnContainer>
            {this.props.failedImports.length === 0 &&
              this.props.ongoingImports.length === 0 && (
                <NoPortsContainer>
                  <PortIcon size="5.9rem" />
                  <NoPortsTitle>You have no pending ports</NoPortsTitle>
                  <NoPortsMessage>
                    Port your Metronome between any of the other supported
                    chains.
                  </NoPortsMessage>
                </NoPortsContainer>
              )}

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
