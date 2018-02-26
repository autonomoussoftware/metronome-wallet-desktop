import { sendToMainProcess, isWeiable, isGreaterThanZero } from '../utils'
import { DisplayValue } from './common'
import * as selectors from '../selectors'
import { debounce } from 'lodash'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Web3 from 'web3'

const Container = styled.div`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin-top: -0.8rem;
  margin-bottom: -0.8rem;
`

const ErrorMsg = styled.div`
  color: ${p => p.theme.colors.danger};
`

class ConverterEstimates extends React.Component {
  static propTypes = {
    converterPrice: PropTypes.string.isRequired,
    convertTo: PropTypes.oneOf(['ETH', 'MTN']).isRequired,
    amount: PropTypes.string
  }

  state = {
    estimate: null,
    error: null
  }

  getEstimate = debounce(() => {
    const { convertTo, amount } = this.props
    if (!isWeiable(amount) || !isGreaterThanZero(amount)) {
      return this.setState({ estimate: null })
    }
    sendToMainProcess(
      convertTo === 'MTN' ? 'metronome-estimate-met' : 'metronome-estimate-eth',
      {
        value: Web3.utils.toWei(amount.replace(',', '.'))
      }
    )
      .then(({ result }) => this.setState({ estimate: result, error: null }))
      .catch(err => this.setState({ estimate: null, error: err.message }))
  }, 500)

  componentWillUpdate({ converterPrice, amount }) {
    // Recalculate estimate if amount or price changed
    if (
      this.props.converterPrice !== converterPrice ||
      this.props.amount !== amount
    ) {
      this.getEstimate()
    }
  }

  render() {
    const { estimate, error } = this.state
    const { convertTo } = this.props

    if (estimate) {
      return (
        <Container>
          <DisplayValue
            maxSize="inherit"
            value={estimate}
            pre="You would get "
            post={` ${convertTo}`}
          />
        </Container>
      )
    }
    if (error)
      return (
        <Container>
          <ErrorMsg>{error}</ErrorMsg>
        </Container>
      )
    return null
  }
}

const mapStateToProps = state => ({
  converterPrice: selectors.getConverterPrice(state)
})

export default connect(mapStateToProps)(ConverterEstimates)
