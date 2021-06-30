import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DisplayValue, Flex } from '../common'
import RetryBtn from './RetryBtn'

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
  font-size: 1.1rem;
  letter-spacing: 0.4px;
  color: #c2c4c6;
  flex-grow: 1;
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
  margin-right: 1.6rem;
`

const Refutations = styled.span`
  color: ${({ theme }) => theme.colors.warning};
  padding: 0.5rem 1.2rem;
  margin-right: 1.6rem;
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

export default class OngoingImports extends React.Component {
  static propTypes = {
    attestationThreshold: PropTypes.number.isRequired,
    retryDisabledReason: PropTypes.string,
    retryDisabled: PropTypes.bool.isRequired,
    onRetryClick: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        attestedCount: PropTypes.number.isRequired,
        refutedCount: PropTypes.number.isRequired,
        importedFrom: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired,
      })
    ).isRequired,
  }

  handleRetryClick = (e) => this.props.onRetryClick(e.target.dataset.hash)

  render() {
    return (
      <List>
        {this.props.items.map((item) => (
          <Item key={item.hash}>
            <Flex.Row justify="space-between" align="center">
              <LeftLabel>
                <Validations>
                  {item.attestedCount} / {this.props.attestationThreshold}
                </Validations>{' '}
                <Hiddable>VALIDATIONS</Hiddable>{' '}
                {item.refutedCount > 0 && (
                  <Refutations>
                    {item.refutedCount}{' '}
                    <Hiddable>
                      {item.refutedCount > 1 ? 'REFUTATIONS' : 'REFUTATION'}
                    </Hiddable>
                  </Refutations>
                )}
              </LeftLabel>
              <Flex.Column align="flex-end">
                <Amount>
                  <DisplayValue value={item.value} post=" MET" />
                </Amount>
                <Details>
                  IMPORTING FROM <span>{item.importedFrom}</span> BLOCKCHAIN
                </Details>
              </Flex.Column>
              <RetryBtn
                data-rh-negative
                data-disabled={this.props.retryDisabled}
                data-hash={item.currentBurnHash}
                onClick={
                  this.props.retryDisabled ? null : this.handleRetryClick
                }
                data-rh={this.props.retryDisabledReason}
              >
                Retry
              </RetryBtn>
            </Flex.Row>
          </Item>
        ))}
      </List>
    )
  }
}
