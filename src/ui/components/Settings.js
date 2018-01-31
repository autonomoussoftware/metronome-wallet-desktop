import { DarkLayout } from '../common';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import React from 'react';

const Body = styled.div`
  padding: 3.2rem 4.8rem;
`;

export default class Settings extends React.Component {
  static propTypes = {
    seed: PropTypes.string.isRequired
  };

  render() {
    return (
      <DarkLayout title="Settings">
        <Body>Content...</Body>
      </DarkLayout>
    );
  }
}
