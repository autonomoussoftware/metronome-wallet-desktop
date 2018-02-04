import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Container = styled.svg`
  display: block;
  width: ${p => (p.size ? p.size : '2.4rem')};
  fill: ${p => (p.color ? p.color : p.theme.colors.light)};
`

export default class BaseIcon extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    color: PropTypes.string,
    size: PropTypes.string
  }

  render() {
    const { children, ...other } = this.props

    return (
      <Container viewBox="0 0 24 24" {...other}>
        {children}
      </Container>
    )
  }
}
