import { flushPromises } from 'react-testing-library'
import { reduxRender } from '../../testUtils'
import config from '../../config'
import React from 'react'
import App from '../App'

const getElement = (response = { onboardingComplete: true }) => (
  <App onMount={() => Promise.resolve(response)} />
)

describe('<App/>', () => {
  it('displays a login form if user is already on board', async () => {
    const { queryByTestId } = reduxRender(
      getElement({ onboardingComplete: true })
    )
    expect(queryByTestId('login-form')).toBeNull()
    await flushPromises()
    expect(queryByTestId('login-form')).not.toBeNull()
  })

  it('displays onboarding wizard if user is NOT on board', async () => {
    const { queryByTestId } = reduxRender(
      getElement({ onboardingComplete: false })
    )
    expect(queryByTestId('onboarding-container')).toBeNull()
    await flushPromises()
    expect(queryByTestId('onboarding-container')).not.toBeNull()
  })

  it('displays a loading screen while waiting for wallet data', async () => {
    const { queryByTestId, store } = reduxRender(getElement())
    await flushPromises()
    expect(queryByTestId('loading-scene')).toBeNull()
    store.dispatch({ type: 'session-started' })
    expect(queryByTestId('loading-scene')).not.toBeNull()
  })

  it('displays router after enough data was received', async () => {
    const { queryByTestId, store } = reduxRender(getElement())
    await flushPromises()

    // In order to display the inner screens of the wallet the Main Process
    // MUST send 1) MET token status, 2) ETH price, 3) wallet balances
    expect(queryByTestId('router-container')).toBeNull()
    store.dispatch({ type: 'session-started' })
    store.dispatch({ type: 'eth-block', payload: { number: 1 } })
    store.dispatch({
      type: 'open-wallets',
      payload: { walletIds: ['foo'], activeWallet: 'foo' }
    })
    store.dispatch({
      type: 'metronome-token-status-updated',
      payload: { transferAllowed: true }
    })
    store.dispatch({
      type: 'eth-price-updated',
      payload: { token: 'ETH', price: 1 }
    })
    store.dispatch({
      type: 'wallet-state-changed',
      payload: {
        foo: {
          addresses: {
            '0x15dd2028C976beaA6668E286b496A518F457b5Cf': {
              token: { [config.MET_TOKEN_ADDR]: { balance: '1' } },
              balance: '1'
            }
          }
        }
      }
    })
    expect(queryByTestId('router-container')).not.toBeNull()
  })
})
