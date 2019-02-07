import styled from 'styled-components'
import React from 'react'

const Currency = styled.span`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
`

export default class AuctionDetails extends React.Component {
  render() {
    return (
      <div>
        <Currency>MET</Currency> purchased in auction
      </div>
    )
  }
}
