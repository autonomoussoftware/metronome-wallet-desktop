import withWalletInfoState from 'metronome-wallet-ui-logic/src/hocs/withWalletInfoState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import LastUpdated, { Label } from '../common/LastUpdated'
import { Flex } from '../common'

const Text = styled.div`
  font-size: 1.3rem;
  margin: 0.8rem 1.6rem 0.8rem 0;
  display: flex;
  align-items: center;
`

const MinedAgo = styled(Label)`
  margin-left: 0.8rem;
`

const IndicatorLed = styled.div`
  width: 10px;
  height: 10px;
  background-color: ${({ isOnline, isConnected, theme }) =>
    isOnline
      ? isConnected
        ? theme.colors.success
        : theme.colors.danger
      : 'rgba(119, 132, 125, 0.68)'};
  border: 1px solid white;
  border-radius: 10px;
  margin: 5px 8px 2px 1px;
`

// eslint-disable-next-line require-jsdoc
function WalletStatus(props) {
  return (
    <div>
      <Text>Version {props.appVersion}</Text>

      <Text>Connected to {props.chainName} chain</Text>

      <LastUpdated
        timestamp={props.bestBlockTimestamp}
        render={({ timeAgo, level }) => (
          <Text>
            Best Block {props.height}
            <MinedAgo level={level} as="span">
              mined {timeAgo}
            </MinedAgo>
          </Text>
        )}
      />

      <Flex.Row align="center">
        {Object.keys(props.connections).map(connectionName => (
          <Text key={connectionName}>
            <IndicatorLed
              isConnected={props.connections[connectionName]}
              isOnline={props.isOnline}
            />
            {connectionName}
          </Text>
        ))}
      </Flex.Row>
    </div>
  )
}

WalletStatus.propTypes = {
  bestBlockTimestamp: PropTypes.number,
  connections: PropTypes.objectOf(PropTypes.bool).isRequired,
  appVersion: PropTypes.string.isRequired,
  chainName: PropTypes.string.isRequired,
  isOnline: PropTypes.bool,
  height: PropTypes.number
}

export default withWalletInfoState(WalletStatus)
