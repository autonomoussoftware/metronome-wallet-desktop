import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import React from 'react';

const Container = styled.div`
  &.fade-enter {
    transition: ${({ timeout }) => `${timeout}ms`} ease-in;
    max-height: 0;
    opacity: 0.01;
  }

  &.fade-enter.fade-enter-active {
    max-height: ${({ maxHeight }) => maxHeight};
    opacity: 1;
    overflow: hidden;
  }

  &.fade-exit {
    opacity: 1;
    transition: ${({ timeout }) => `${timeout}ms`} ease-in;
    max-height: ${({ maxHeight }) => maxHeight};
  }

  &.fade-exit.fade-exit-active {
    opacity: 0.01;
    max-height: 0;
    overflow: hidden;
  }
`;

const Fade = ({ maxHeight, children, timeout = 200, ...other }) => (
  <CSSTransition timeout={timeout} classNames="fade" {...other}>
    <Container timeout={timeout} maxHeight={maxHeight}>
      {children}
    </Container>
  </CSSTransition>
);

Fade.propTypes = {
  maxHeight: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  timeout: PropTypes.number
};

export default Fade;
