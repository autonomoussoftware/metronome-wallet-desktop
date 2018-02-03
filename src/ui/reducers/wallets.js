import { handleActions } from 'redux-actions'
import walletReducer from './wallet'
import actions from '../actions'

const initialState = {
  all: {},
  active: '0xae6e5f1471b30ef80af5a0e641a3880cbaf27d76' // TODO: harcoded for now
}

const reducer = handleActions(
  {
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
