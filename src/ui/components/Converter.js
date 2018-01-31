import { DarkLayout, Sp } from '../common';
import PropTypes from 'prop-types';
import React from 'react';

export default class Auction extends React.Component {
  static propTypes = {
    seed: PropTypes.string.isRequired
  };

  render() {
    return (
      <DarkLayout title="Autonomous Converter">
        <Sp py={4} px={6}>
          Content...
        </Sp>
      </DarkLayout>
    );
  }
}
