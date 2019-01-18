import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DisplayValue, Flex, Btn } from '../common'

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

export default class FailedImports extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        originChain: PropTypes.string.isRequired,
        receipt: PropTypes.shape({}),
        meta: PropTypes.shape({
          currentBurnHash: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired
        })
      })
    ).isRequired,
    onRetry: PropTypes.func.isRequired
  }

  handleRetryClick = e => this.props.onRetry(e.target.dataset.hash)

  render() {
    return (
      <List>
        {this.props.items.map(item => (
          <Item key={item.meta.currentBurnHash}>
            <Flex.Row justify="space-between" align="center">
              <LeftLabel>FAILED</LeftLabel>
              <Flex.Row justify="space-between" align="center">
                <Flex.Column align="flex-end">
                  <Amount>
                    <DisplayValue value={item.meta.value} post=" MET" />
                  </Amount>
                  <Details>
                    EXPORTED FROM <span>{item.originChain}</span>
                  </Details>
                </Flex.Column>
                <RetryBtn
                  data-hash={item.currentBurnHash}
                  onClick={this.handleRetryClick}
                >
                  Retry
                </RetryBtn>
              </Flex.Row>
            </Flex.Row>
          </Item>
        ))}
      </List>
    )
  }
}
