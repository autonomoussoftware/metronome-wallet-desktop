import { handleActions } from "redux-actions"
import walletReducer from "./wallet"
import actions from "../actions"

const initialState = {
  all: {},
  active: null
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
