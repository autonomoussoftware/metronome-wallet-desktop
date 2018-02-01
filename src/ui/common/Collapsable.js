import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import React from 'react';

const Container = styled.div`
  &.collapse-enter {
    transition: ${({ timeout }) => `${timeout}ms`} ease-in;
    max-height: 0;
  }

  &.collapse-enter.collapse-enter-active {
    max-height: ${({ maxHeight }) => maxHeight};
    overflow: hidden;
  }

  &.collapse-exit {
    transition: ${({ timeout }) => `${timeout}ms`} ease-in;
    max-height: ${({ maxHeight }) => maxHeight};
  }

  &.collapse-exit.collapse-exit-active {
    max-height: 0;
    overflow: hidden;
  }
`;

const Collapsable = ({ maxHeight, children, timeout = 200, ...other }) => (
  <CSSTransition timeout={timeout} classNames="collapse" {...other}>
    <Container timeout={timeout} maxHeight={maxHeight}>
      {children}
    </Container>
  </CSSTransition>
);

Collapsable.propTypes = {
  maxHeight: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  timeout: PropTypes.number
};

export default Collapsable;
