import withFailedImportsState from 'metronome-wallet-ui-logic/src/hocs/withFailedImportsState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Container = styled.div`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.danger};
  border-radius: 1.2rem;
  font-size: 1.1rem;
  height: 2.4rem;
  line-height: 2.4rem;
  padding: 0 0.8rem;
  letter-spacing: 1px;
  min-width: 3.2rem;
  text-align: center;
  transform: translate3d(-93px, 22px, 0);

  ${({ parent }) => parent}:hover & {
    background-color: ${({ theme }) => theme.colors.darkDanger};
    transform: translateX(0px);
  }

  @media (min-width: 800px) {
    background-color: ${({ theme }) => theme.colors.darkDanger};
    transform: translateX(0px);
  }
`

class FailedImportsBadge extends React.Component {
  static propTypes = {
    parent: PropTypes.object.isRequired,
    amount: PropTypes.number.isRequired,
  }

  render() {
    if (!this.props.amount || this.props.amount < 1) return null
    return <Container parent={this.props.parent}>{this.props.amount}</Container>
  }
}

export default withFailedImportsState(FailedImportsBadge)
