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
  margin-top: 1.6rem;
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  opacity: ${p => (p.weak ? 0.5 : 1)};
`

const ErrorMsg = styled.div`
  color: ${p => p.theme.colors.danger};
`

class ConverterEstimates extends React.Component {
  static propTypes = {
    converterPrice: PropTypes.string.isRequired,
    convertTo: PropTypes.oneOf(['ETH', 'MET']).isRequired,
    onChange: PropTypes.func.isRequired,
    estimate: PropTypes.string,
    amount: PropTypes.string
  }

  state = { error: null, status: 'init' }

  getEstimate = debounce(() => {
    const { convertTo, amount } = this.props
    if (!isWeiable(amount) || !isGreaterThanZero(amount)) {
      return this.props.onChange({ target: { id: 'estimate', value: null } })
    }
    this.setState({ error: null, status: 'pending' })
    sendToMainProcess(
      convertTo === 'MET'
        ? 'metronome-estimate-eth-to-met'
        : 'metronome-estimate-met-to-eth',
      {
        value: Web3.utils.toWei(amount.replace(',', '.'))
      }
    )
      .then(({ result }) => {
        this.setState({ error: null, status: 'success' })
        this.props.onChange({ target: { id: 'estimate', value: result } })
      })
      .catch(err => {
        this.setState({ error: err.message, status: 'failure' })
        this.props.onChange({ target: { id: 'estimate', value: null } })
      })
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
    const { estimate, convertTo } = this.props
    const { error, status: estimateStatus } = this.state

    if (['success', 'init'].includes(estimateStatus) && estimate) {
      return (
        <Container>
          <DisplayValue
            value={estimate}
            pre="You would get approximately "
            post={` ${convertTo}.`}
          />
        </Container>
      )
    }
    if (estimateStatus === 'failure' && error)
      return (
        <Container>
          <ErrorMsg>{error}</ErrorMsg>
        </Container>
      )
    if (estimateStatus === 'pending')
      return <Container weak>Getting conversion estimate...</Container>
    return (
      <Container>Enter a valid amount to get a conversion estimate.</Container>
    )
  }
}

const mapStateToProps = state => ({
  converterPrice: selectors.getConverterPrice(state)
})

export default connect(mapStateToProps)(ConverterEstimates)
