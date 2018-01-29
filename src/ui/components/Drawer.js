import PropTypes from 'prop-types';
import styled from 'styled-components';
import Modal from 'react-modal';
import React from 'react';

const Container = styled(Modal)`
  &.ReactModal__Content {
    transition: 0.6s;
    transform: translate3d(100%, 0, 0);
  }
  &.ReactModal__Content--after-open {
    transform: translate3d(0, 0, 0);
  }

  &.ReactModal__Content--before-close {
    transform: translate3d(100%, 0, 0);
  }
`;

Modal.setAppElement('#root');

export default class Drawer extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  render() {
    const { onRequestClose, children, isOpen } = this.props;

    return (
      <Container
        onRequestClose={onRequestClose}
        closeTimeoutMS={600}
        contentLabel="Modal"
        isOpen={isOpen}
        style={{
          content: {
            backgroundImage: 'linear-gradient(to bottom, #272727, #323232)',
            borderRadius: '0',
            boxShadow: '0 0 16px 0 rgba(0, 0, 0, 0.2)',
            overflowY: 'auto',
            position: 'absolute',
            width: '460px',
            outline: 'none',
            padding: '0',
            border: 'none',
            bottom: '0',
            right: '0',
            left: 'auto',
            top: '0'
          }
        }}
      >
        {children}
      </Container>
    );
  }
}
