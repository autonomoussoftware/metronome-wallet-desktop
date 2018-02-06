import { handleActions } from 'redux-actions'
import actions from '../actions'
import _ from 'lodash'

const initialState = {
  all: null,
  active: null
}

const reducer = handleActions(
  {
    'create-wallet': (state, action) => ({
      ...state,
      all: {
        [action.payload.walletId]: {
          addresses: {}
        }
      },
      active: action.payload.walletId
    }),

    'open-wallets': (state, action) => ({
      ...state,
      all: action.payload.walletIds.reduce((all, walletId) => {
        all[walletId] = { addresses: {} }
        return all
      }, {}),
      active: action.payload.walletIds[0] || null
    }),

    'wallet-state-changed': (state, action) => ({
      ...state,
      all: {
        ...state.all,
        ..._.mapValues(action.payload, (updateWalletData, walletId) =>
          reduceWallet(state.all[walletId], updateWalletData)
        )
      }
    }),

    [actions.activeWalletChanged]: (state, action) => ({
      ...state,
      active: action.payload
    })
  },
  initialState
)

function reduceWallet(wallet = { addresses: {} }, payload) {
  return {
    ...wallet,
    addresses: {
      ...wallet.addresses,
      ..._.mapValues(payload.addresses, (updateAddressData, address) =>
        reduceAddress(wallet.addresses[address], updateAddressData)
      )
    }
  }
}

function reduceAddress(addressData = {}, payload) {
  return {
    ...addressData,
    ...payload
  }
}

export default reducer
