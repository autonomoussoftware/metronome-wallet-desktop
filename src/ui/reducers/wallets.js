import { handleActions } from 'redux-actions'
import walletReducer from './wallet'
import actions from '../actions'

const initialState = {
  all: null,
  active: null
}

const reducer = handleActions(
  {
    'open-wallets': (state, action) => ({
      ...state,
      // must return a dictionary of type { [id]: Wallet }
      all: action.payload
        ? action.payload.data.walletIds.reduce((all, walletId) => {
            all[walletId] = {}
            return all
          }, {})
        : {},
      // must return the first available id or null if no addresses
      active: action.payload.data.walletIds[0] || null
    }),

    'wallet-state-changed': (state, action) => ({
      ...state,
      all: {
        ...state.all,
        [action.payload.walletId]: {
          ...state.all[action.payload.walletId],
          MTNbalance: action.payload.balance
        }
      }
    }),

    [actions.activeWalletChanged]: (state, action) => ({
      ...state,
      active: action.payload
    }),

    [actions.walletBalanceUpdated]: (state, action) => ({
      ...state,
      all: {
        ...state.all,
        [action.payload.address]: walletReducer(
          state[action.payload.address],
          action
        )
      }
    })
  },
  initialState
)

export default reducer
