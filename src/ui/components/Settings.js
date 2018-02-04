import { DarkLayout, Sp } from '../common'
// import PropTypes from 'prop-types';
import React from 'react'

export default class Settings extends React.Component {
  static propTypes = {}

  render() {
    return (
      <DarkLayout title="Settings">
        <Sp py={4} px={6}>
          Content...
        </Sp>
      </DarkLayout>
    )
  }
}
