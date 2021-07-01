import CountDownProvider from 'metronome-wallet-ui-logic/src/hocs/CountDownProvider'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Row = styled.div`
  margin-top: 1.6rem;
  display: flex;
  border-radius: 4px;
  background-color: ${p => p.theme.colors.lightShade};
`

const Cell = styled.div`
  opacity: ${({ isFaded }) => (isFaded ? '0.5' : '1')};
  padding: 1.6rem;
  flex-grow: 1;
  flex-basis: 0;
  color: ${p => p.theme.colors.primary};
  line-height: 6rem;
  letter-spacing: -1px;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  border-left: 1px solid ${p => p.theme.colors.darkShade};
  font-size: 2.4rem;
  &:first-child {
    border-left: none;
  }
  @media (min-width: 960px) {
    font-size: 3.2rem;
  }
  @media (min-width: 1280px) {
    padding: 3rem;
    font-size: 4.8rem;
  }
`

export default class CountDown extends React.Component {
  static propTypes = {
    targetTimestamp: PropTypes.number.isRequired
  }

  render() {
    const { targetTimestamp } = this.props

    return (
      <CountDownProvider targetTimestamp={targetTimestamp}>
        {({ days, hours, minutes, seconds, inFuture }) =>
          inFuture ? (
            <Row data-testid="countdown">
              <Cell isFaded={days === 0}>{days} days</Cell>
              <Cell isFaded={days + hours === 0}>{hours} hrs</Cell>
              <Cell isFaded={days + hours + minutes === 0}>{minutes} mins</Cell>
              <Cell isFaded={days + hours + minutes + seconds === 0}>
                {seconds} secs
              </Cell>
            </Row>
          ) : (
            <Row data-testid="waiting-next">
              <Cell>Waiting to confirm auction start...</Cell>
            </Row>
          )
        }
      </CountDownProvider>
    )
  }
}
