import withScanIndicatorState from 'metronome-wallet-ui-logic/src/hocs/withScanIndicatorState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import Spinner from '../../common/Spinner'

const Container = styled.div`
  display: flex;
  align-items: center;
  border-radius: 12px;
  background-color: ${p => p.theme.colors.lightShade};
  padding: 0.4rem 1rem 0.4rem 0.4rem;
  margin-top: 3px;
  cursor: ${({ isDisabled }) => (isDisabled ? 'auto' : 'pointer')};

  &:hover {
    background-color: ${({ theme, isDisabled }) =>
      theme.colors[isDisabled ? 'lightShade' : 'darkShade']};
  }
`

const Label = styled.div`
  font-size: 1.3rem;
  line-height: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-left: 7px;
`

const IndicatorLed = styled.div`
  width: 10px;
  height: 10px;
  background-color: ${({ isOnline, syncStatus, theme }) =>
    !isOnline
      ? 'rgba(119, 132, 125, 0.68)'
      : syncStatus === 'failed'
      ? theme.colors.danger
      : '#45d48d'};
  border: 1px solid white;
  border-radius: 10px;
  margin: 3px;
`

class ScanIndicator extends React.Component {
  static propTypes = {
    onLabelClick: PropTypes.func.isRequired,
    syncStatus: PropTypes.oneOf(['up-to-date', 'syncing', 'failed']).isRequired,
    isOnline: PropTypes.bool.isRequired,
    tooltip: PropTypes.string,
    label: PropTypes.string.isRequired
  }

  render() {
    return (
      <Container
        isDisabled={this.props.syncStatus === 'syncing' || !this.props.isOnline}
        onClick={this.props.onLabelClick}
        data-rh={this.props.tooltip}
      >
        {this.props.isOnline && this.props.syncStatus === 'syncing' ? (
          <Spinner />
        ) : (
          <IndicatorLed
            syncStatus={this.props.syncStatus}
            isOnline={this.props.isOnline}
          />
        )}
        <Label>{this.props.label}</Label>
      </Container>
    )
  }
}

export default withScanIndicatorState(ScanIndicator)
