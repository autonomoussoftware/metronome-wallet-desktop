import { DarkLayout, Sp } from '../common';
// import PropTypes from 'prop-types';
import React from 'react';

export default class Help extends React.Component {
  static propTypes = {};

  render() {
    return (
      <DarkLayout title="Help">
        <Sp py={4} px={6}>
          Content...
        </Sp>
      </DarkLayout>
    );
  }
}
