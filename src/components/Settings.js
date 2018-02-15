import React from 'react'
import { DarkLayout, Btn, Sp, TextInput } from './common'

const { ipcRenderer } = window.require('electron')

export default class Settings extends React.Component {
  static propTypes = {}

  state = {
    ethereumNetworkUrl: ipcRenderer.sendSync('settings-get', { key:'app.node.websocketApiUrl' }),
    errors: {},
    status: 'init',
    error: null
  }

  onInputChanged = e => {
    const { id, value } = e.target

    this.setState(state => ({
      ...state,
      errors: { ...state.errors, [id]: null },
      [id]: value
    }))
  }

  onSubmit = e => {
    e.preventDefault()
    // TODO: validate ws URL

    ipcRenderer.sendSync('settings-set', {
      key: 'app.node.websocketApiUrl',
      value: this.state.ethereumNetworkUrl
    })
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
              value={ethereumNetworkUrl}
              id="ethereumNetworkUrl"
            />

            <Sp mt={4}>
              <Btn submit>
                Save & Restart
              </Btn>
            </Sp>

          </form>
        </Sp>
      </DarkLayout>
    )
  }
}
