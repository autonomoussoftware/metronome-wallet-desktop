import { handleActions } from 'redux-actions'
import walletReducer from './wallet'
import actions from '../actions'

const initialState = {
  all: null,
  active: null
}

const reducer = handleActions(
  {
    'wallets-retrieved': (state, action) => ({
      ...state,
      // must return a dictionary of type { [address]: Wallet }
      all: action.payload
        ? action.payload.reduce((all, wallet) => {
            if (wallet.address) {
              all[wallet.address] = wallet
            }
            return all
          }, {})
        : {},
      // must return the first available address or null if no addresses
      active:
        action.payload && action.payload.length > 0
          ? action.payload[0].address
          : null
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
