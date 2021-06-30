import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { DisplayValue } from '../common'

const Container = styled.div`
  margin-top: 1.6rem;
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${(p) => p.theme.colors.darkShade};
  opacity: ${(p) => (p.weak ? 0.5 : 1)};
`

const ErrorMsg = styled.div`
  color: ${(p) => p.theme.colors.danger};
`

export default class FeeEstimates extends React.Component {
  static propTypes = {
    feeError: PropTypes.string,
    fee: PropTypes.string,
  }

  render() {
    return (
      <React.Fragment>
        {this.props.fee && (
          <Container>
            You would pay a fee of approximately{' '}
            <DisplayValue
              inline
              value={this.props.fee}
              color="primary"
              post=" MET"
            />
          </Container>
        )}
        {this.props.feeError && (
          <Container>
            <ErrorMsg color="danger" mt={1}>
              Error getting fee estimate: {this.props.feeError}
            </ErrorMsg>
          </Container>
        )}
      </React.Fragment>
    )
  }
}
