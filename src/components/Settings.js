import React from 'react'

import { DarkLayout, Btn, Sp, TextInput } from './common'

export default class Settings extends React.Component {
  static propTypes = {}

  state = {
    ethereumNetworkUrl: null,
    errors: {},
    status: 'init',
    error: null
  }

  onInputChanged () {

  }

  onSubmit () {

  }

  render() {
    const { ethereumNetworkUrl, errors } = this.state

    return (
      <DarkLayout title="Settings">
        <Sp py={4} px={6}>
          <form onSubmit={this.onSubmit}>

            <TextInput
              autoFocus
              onChange={this.onInputChanged}
              label="Ethereum Network URL"
              error={errors.ethereumNetworkUrl}
              value={ethereumNetworkUrl || ''}
              rows="3"
              id="mnemonic"
            />

            <Sp mt={4}>
              <Btn submit>
                Save
              </Btn>
            </Sp>

          </form>
        </Sp>
      </DarkLayout>
    )
  }
}
