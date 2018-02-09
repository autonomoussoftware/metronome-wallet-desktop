import { Modal, Btn } from './common'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Container = styled.div`
  background-color: ${p => p.theme.colors.bg.medium};
`

const Row = styled.div`
  padding: 1.6rem 0;
  margin: 0 1.6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: ${p =>
    p.first ? 'none' : `1px solid ${p.theme.colors.lightShade}`};
`

const Label = styled.div`
  line-height: 1.4rem;
  font-size: 1.1rem;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: ${p => p.theme.colors.copy};
  margin-right: 1.6rem;
  white-space: nowrap;
`

const Value = styled.div`
  color: ${p => p.theme.colors.copy};
  text-align: right;
  line-height: 1.6rem;
  font-size: 1.3rem;
`

const Amount = styled.div`
  color: ${p => p.theme.colors.primary};
  line-height: 2.5rem;
  font-size: 2rem;
  text-align: right;
`

const Type = Value.extend`
  text-transform: capitalize;
`

const Address = Value.extend`
  word-wrap: break-word;
  word-break: break-word;
`

const ExplorerBtn = Btn.extend`
  line-height: 1.5rem;
  opacity: 0.7;
  font-size: 1.4rem;
  letter-spacing: 1.4px;
  border-radius: 0;
`

export default class ReceiptModal extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    tx: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }

  render() {
    const { onRequestClose, isOpen, tx = {} } = this.props

    return (
      <Modal onRequestClose={onRequestClose} isOpen={isOpen}>
        <Container>
          <Row first>
            <Label>Amount</Label>
            <Amount>{tx.amount}</Amount>
          </Row>
          <Row>
            <Label>Type</Label>
            <Type>{tx.type}</Type>
          </Row>
          {tx.from && (
            <Row>
              <Label>Received from</Label>
              <Address>{tx.from}</Address>
            </Row>
          )}
          {tx.status && (
            <Row>
              <Label>Status</Label>
              <Value>Pending {tx.status}</Value>
            </Row>
          )}
          <ExplorerBtn block>VIEW IN EXPLORER</ExplorerBtn>
        </Container>
      </Modal>
    )
  }
}
