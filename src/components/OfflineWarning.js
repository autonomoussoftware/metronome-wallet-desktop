import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import * as selectors from '../selectors'
import { BaseBtn } from './common'
import CloseIcon from './icons/CloseIcon'

const Container = styled.div`
  position: fixed;
  top: 0;
  z-index: 3;
  right: 0;
  left: 0;
  padding: 0.4rem;
  background: rgba(248, 123, 97, 1);
  text-align: center;
  font-size: 1.2rem;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
`

const DismissBtn = BaseBtn.extend`
  position: relative;
  top: 1px;
  left: 6px;
`

class OfflineWarning extends React.Component {
  static propTypes = {
    isOnline: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      isVisible: !props.isOnline
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.isOnline) {
      this.setState({ isVisible: false })
    } else if (newProps.isOnline !== this.props.isOnline) {
      this.setState({ isVisible: true })
    }
  }

  onDismissClick = () => this.setState({ isVisible: false })

  render() {
    const { isVisible } = this.state

    return (
      isVisible && (
        <Container>
          Your wallet is not connected to the network. Check your internet
          connection.{' '}
          <DismissBtn onClick={this.onDismissClick}>
            <CloseIcon size="1.2rem" />
          </DismissBtn>
        </Container>
      )
    )
  }
}

const mapStateToProps = state => ({
  isOnline: selectors.getIsOnline(state)
})

export default connect(mapStateToProps)(OfflineWarning)
