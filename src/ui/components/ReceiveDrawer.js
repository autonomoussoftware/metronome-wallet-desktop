import PropTypes from 'prop-types';
import styled from 'styled-components';
import Drawer from './Drawer';
import React from 'react';

const Container = styled.div`
  padding: 0 4.8rem;
`;

export default class Receive extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  render() {
    const { onRequestClose, isOpen } = this.props;

    return (
      <Drawer onRequestClose={onRequestClose} isOpen={isOpen}>
        <Container>
          <h1>Receive</h1>
        </Container>
      </Drawer>
    );
  }
}
