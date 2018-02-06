import { LoadingBar } from '../common'
import AltLayout from './AltLayout'
import React from 'react'

export default class LoadingScene extends React.Component {
  render() {
    return (
      <AltLayout title="Contacting Network...">
        <LoadingBar />
      </AltLayout>
    )
  }
}
