import { Drawer } from '../common';
import PropTypes from 'prop-types';
import React from 'react';

export default class Receive extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  };

  render() {
    const { onRequestClose, isOpen } = this.props;

    return (
      <Drawer
        onRequestClose={onRequestClose}
        isOpen={isOpen}
        title="Receive Transaction"
      >
        <p>Content...</p>
      </Drawer>
    );
  }
}
