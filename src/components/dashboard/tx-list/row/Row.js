import withTxRowState from 'metronome-wallet-ui-logic/src/hocs/withTxRowState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import Details from './Details'
import Amount from './Amount'
import Icon from './Icon'

const Container = styled.div`
  margin-left: 1.6rem;
  padding: 1.2rem 2.4rem 1.2rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -1px 0 0 ${p => p.theme.colors.lightShade} inset;
  cursor: pointer;
  height: 66px;
`

class Row extends React.Component {
  static propTypes = {
    tx: PropTypes.any
  }
  render() {
    const { tx, ...other } = this.props

    return (
      <Container {...other}>
        <Icon {...this.props} />
        <div>
          <Amount {...this.props} />
          <Details {...this.props} />
        </div>
      </Container>
    )
  }
}

export default withTxRowState(Row)
