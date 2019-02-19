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
            {this.props.failedImports.length > 0 && (
              <React.Fragment>
                <Title>Failed Ports</Title>
                <Description>
                  Resubmit incomplete ports that failed to excecute by clicking
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
                  items={this.props.ongoingImports}
                />
              </React.Fragment>
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
