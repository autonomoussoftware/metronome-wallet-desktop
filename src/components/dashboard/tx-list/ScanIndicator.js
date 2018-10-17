import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import * as selectors from '../../../selectors'
import Spinner from '../../common/Spinner'

const Container = styled.div`
  display: flex;
  align-items: center;
  border-radius: 12px;
  background-color: ${p => p.theme.colors.lightShade};
  padding: 0.4rem 1rem 0.4rem 0.4rem;
  margin-top: 3px;
`

const Label = styled.div`
  font-size: 1.3rem;
  line-height: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-left: 7px;
`

const GreenLight = styled.div`
  width: 10px;
  height: 10px;
  background-color: ${({ isOnline }) =>
    isOnline ? '#45d48d' : 'rgba(119, 132, 125, 0.68)'};
  border: 1px solid white;
  border-radius: 10px;
  margin: 3px;
`

class ScanIndicator extends React.Component {
  static propTypes = {
    isScanning: PropTypes.bool.isRequired,
    isOnline: PropTypes.bool.isRequired
  }

  render() {
    const { isScanning, isOnline } = this.props

    return (
      <Container>
        {isOnline && isScanning ? (
          <Spinner />
        ) : (
          <GreenLight isOnline={isOnline} />
        )}
        <Label>
          {!isOnline
            ? 'Offline'
            : isScanning
              ? 'Fetching your transactions…'
              : 'Up-to-date'}
        </Label>
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  isScanning: selectors.getIsScanningTx(state),
  isOnline: selectors.getIsOnline(state)
})

export default connect(mapStateToProps)(ScanIndicator)
