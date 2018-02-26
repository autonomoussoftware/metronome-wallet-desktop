import { CSSTransition } from 'react-transition-group'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Container = styled.div`
  will-change: height;
  transition: height ${({ timeout }) => `${timeout}ms`} ease-in;
  overflow: hidden;

  &.collapse-exit.collapse-exit-active,
  &.collapse-enter {
    height: 0;
  }

  &.collapse-enter.collapse-enter-active,
  &.collapse-exit {
    height: ${({ height }) => height};
  }
`

const Collapsable = ({ height, children, timeout = 200, ...other }) => (
  <CSSTransition timeout={timeout} classNames="collapse" {...other}>
    <Container timeout={timeout} height={height}>
      {children}
    </Container>
  </CSSTransition>
)

Collapsable.propTypes = {
  children: PropTypes.node.isRequired,
  timeout: PropTypes.number,
  height: PropTypes.string.isRequired
}

export default Collapsable
